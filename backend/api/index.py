import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    '''Создание подключения к базе данных'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с клиентами, товарами и заявками
    GET /clients - получить список клиентов
    GET /products - получить список товаров
    GET /categories - получить список категорий
    GET /orders?client_id=X - получить заявки (опционально по клиенту)
    POST /orders - создать новую заявку
    PUT /orders/:id - обновить статус заявки
    '''
    method: str = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if not action:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'action parameter is required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET' and action == 'clients':
            cur.execute('SELECT * FROM clients ORDER BY id')
            clients = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(c) for c in clients], default=str),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and action == 'products':
            cur.execute('''
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.id
            ''')
            products = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(p) for p in products], default=str),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and action == 'categories':
            cur.execute('SELECT * FROM categories ORDER BY id')
            categories = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(c) for c in categories], default=str),
                'isBase64Encoded': False
            }
        
        if method == 'GET' and action == 'orders':
            client_id = query_params.get('client_id')
            if client_id:
                cur.execute('''
                    SELECT o.*, c.name as client_name, c.legal_entity, c.address 
                    FROM orders o 
                    JOIN clients c ON o.client_id = c.id 
                    WHERE o.client_id = %s 
                    ORDER BY o.created_at DESC
                ''', (client_id,))
            else:
                cur.execute('''
                    SELECT o.*, c.name as client_name, c.legal_entity, c.address 
                    FROM orders o 
                    JOIN clients c ON o.client_id = c.id 
                    ORDER BY o.created_at DESC
                ''')
            orders = cur.fetchall()
            
            result = []
            for order in orders:
                cur.execute('''
                    SELECT oi.*, p.name as product_name, p.unit 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = %s
                ''', (order['id'],))
                items = cur.fetchall()
                order_dict = dict(order)
                order_dict['items'] = [dict(i) for i in items]
                result.append(order_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result, default=str),
                'isBase64Encoded': False
            }
        
        if method == 'POST' and action == 'create_order':
            body_data = json.loads(event.get('body', '{}'))
            client_id = body_data.get('client_id')
            items = body_data.get('items', [])
            
            if not client_id or not items:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id and items are required'}),
                    'isBase64Encoded': False
                }
            
            total = sum(item['price'] * item['quantity'] for item in items)
            
            cur.execute(
                'INSERT INTO orders (client_id, total, status) VALUES (%s, %s, %s) RETURNING id',
                (client_id, total, 'pending')
            )
            order_id = cur.fetchone()['id']
            
            for item in items:
                cur.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)',
                    (order_id, item['product_id'], item['quantity'], item['price'])
                )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'order_id': order_id, 'status': 'pending'}),
                'isBase64Encoded': False
            }
        
        if method == 'PUT' and action == 'update_order':
            order_id = query_params.get('order_id')
            body_data = json.loads(event.get('body', '{}'))
            status = body_data.get('status')
            
            if status not in ['pending', 'approved', 'rejected']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid status'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('UPDATE orders SET status = %s WHERE id = %s', (status, order_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'status': status}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
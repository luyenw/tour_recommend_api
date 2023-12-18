import pika
import time
import numpy as np
# load numpy array
import logging

logging.basicConfig(
    format='%(asctime)s %(levelname)s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
)

item_embeddings = np.load('item_embeddings.npy')
id_array = np.load('id_array.npy')
des_array = np.load('des_array.npy')

def cosine_similarity(vector, array_of_vectors):
    vector_norm = np.linalg.norm(vector)
    array_of_vectors_norms = np.linalg.norm(array_of_vectors, axis=1)
    cosine_similarities = np.dot(array_of_vectors, vector) / (array_of_vectors_norms * vector_norm)
    return cosine_similarities

def get_topk_by_id(id, k):
    idx = np.where(id_array == id)[0][0]
    embedding = item_embeddings[idx]
    sim = cosine_similarity(embedding, item_embeddings)
    sorted_indices = np.argsort(sim)[::-1]
    sorted_array = [id_array[i] for i in sorted_indices]
    return sorted_array[1: k+1]
# rabbitmq 
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='rpc_queue')

def on_request(ch, method, props, body):
    msg = body.decode()
    logging.info('On request: '+msg)
    ch.basic_publish(
        exchange='',
        routing_key=str(props.reply_to),
        properties=pika.BasicProperties(correlation_id=props.correlation_id),
        body=str(get_topk_by_id(msg, 10))
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

print(id_array.shape)
print("Awaiting RPC requests...")
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='rpc_queue', on_message_callback=on_request)
channel.start_consuming()
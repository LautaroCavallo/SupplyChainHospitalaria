# Redpanda (broker Kafka-compatible) para Railway.
# La red interna de Railway es IPv6 → bindeamos a [::] y advertimos el hostname interno.
FROM redpandadata/redpanda:v24.2.7

# El hostname interno lo resuelve Railway como <nombre-servicio>.railway.internal
CMD ["redpanda", "start", \
     "--mode", "dev-container", \
     "--kafka-addr", "PLAINTEXT://0.0.0.0:9092", \
     "--advertise-kafka-addr", "PLAINTEXT://redpanda.railway.internal:9092", \
     "--node-id", "0"]

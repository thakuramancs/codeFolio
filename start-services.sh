#!/bin/bash

# Start Registry Server
cd registory-Server
./mvnw spring-boot:run &
sleep 10

# Start Config Server
cd configServer
./mvnw spring-boot:run &
sleep 10

# Start Auth Service
cd authService
./mvnw spring-boot:run &
sleep 10

# Start Contest Service
cd contestService
./mvnw spring-boot:run &
sleep 10

# Start API Gateway
cd apiGateway
./mvnw spring-boot:run &
sleep 10

# Start Frontend
cd frontend
npm start 
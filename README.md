# Node.js Microservices with Kubernetes - Todo Application

A microservices-based Todo application built with Node.js, MongoDB, and deployed on Kubernetes.

## Architecture

This project consists of three microservices:
- **API Gateway** - Entry point for all client requests
- **Todo Service** - Manages todo items
- **User Service** - Manages user authentication and data
- **MongoDB** - Database for storing data

## Prerequisites

- Docker installed
- Kubernetes cluster (minikube, Docker Desktop, or cloud provider)
- kubectl CLI tool
- Node.js and npm (for local development)

## Docker Commands

### Build Docker Images

```bash
# Build API Gateway
cd api-gateway
docker build -t api-gateway:latest .

# Build Todo Service
cd ../todo-service
docker build -t todo-service:latest .

# Build User Service
cd ../user-service
docker build -t user-service:latest .
```

### Tag Images for Registry (if pushing to Docker Hub)

```bash
# Replace 'yourusername' with your Docker Hub username
docker tag api-gateway:latest yourusername/api-gateway:latest
docker tag todo-service:latest yourusername/todo-service:latest
docker tag user-service:latest yourusername/user-service:latest
```

### Push Images to Registry

```bash
# Login to Docker Hub
docker login

# Push images
docker push yourusername/api-gateway:latest
docker push yourusername/todo-service:latest
docker push yourusername/user-service:latest
```

### Run Containers Locally (without Kubernetes)

```bash
# Run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Run services (update image names and environment variables as needed)
docker run -d --name todo-service -p 3001:3001 todo-service:latest
docker run -d --name user-service -p 3002:3002 user-service:latest
docker run -d --name api-gateway -p 3000:3000 api-gateway:latest
```

### Docker Compose (Alternative)

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build
```

### Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs <container-id>

# Stop a container
docker stop <container-id>

# Remove a container
docker rm <container-id>

# List images
docker images

# Remove an image
docker rmi <image-id>

# Clean up unused resources
docker system prune -a
```

## Kubernetes Commands

### Start Kubernetes Cluster

```bash
# Using minikube
minikube start

# Check cluster status
kubectl cluster-info

# View nodes
kubectl get nodes
```

### Deploy Application

```bash
# Apply all Kubernetes manifests in order
kubectl apply -f k8s/01-namespace.yaml
kubectl apply -f k8s/02-mongo-deployment.yaml
kubectl apply -f k8s/03-mongo-service.yaml
kubectl apply -f k8s/04-todo-deployment.yaml
kubectl apply -f k8s/05-todo-service.yaml
kubectl apply -f k8s/06-user-deployment.yaml
kubectl apply -f k8s/07-user-service.yaml
kubectl apply -f k8s/08-gateway-deployment.yaml
kubectl apply -f k8s/09-gateway-service.yaml

# Or apply all at once
kubectl apply -f k8s/
```

### View Resources

```bash
# View all resources in the namespace
kubectl get all -n microservices

# View pods
kubectl get pods -n microservices

# View detailed pod information
kubectl describe pod <pod-name> -n microservices

# View services
kubectl get services -n microservices
kubectl get svc -n microservices

# View deployments
kubectl get deployments -n microservices

# View namespaces
kubectl get namespaces
```

### Check Logs

```bash
# View logs from a pod
kubectl logs <pod-name> -n microservices

# Follow logs (stream)
kubectl logs -f <pod-name> -n microservices

# View logs from previous container instance
kubectl logs <pod-name> -n microservices --previous

# View logs from specific container in a pod
kubectl logs <pod-name> -c <container-name> -n microservices
```

### Access Services

```bash
# Port forward to access service locally
kubectl port-forward svc/gateway-service 3000:3000 -n microservices

# Get service URL (minikube)
minikube service gateway-service -n microservices --url

# Access service in browser (minikube)
minikube service gateway-service -n microservices
```

### Scale Deployments

```bash
# Scale a deployment
kubectl scale deployment todo-service --replicas=3 -n microservices

# Auto-scale based on CPU
kubectl autoscale deployment todo-service --min=2 --max=5 --cpu-percent=80 -n microservices

# View horizontal pod autoscalers
kubectl get hpa -n microservices
```

### Update Deployments

```bash
# Update image
kubectl set image deployment/todo-service todo-service=todo-service:v2 -n microservices

# Restart a deployment (rolling restart)
kubectl rollout restart deployment/todo-service -n microservices

# Check rollout status
kubectl rollout status deployment/todo-service -n microservices

# View rollout history
kubectl rollout history deployment/todo-service -n microservices

# Rollback to previous version
kubectl rollout undo deployment/todo-service -n microservices
```

### Execute Commands in Pods

```bash
# Open a shell in a pod
kubectl exec -it <pod-name> -n microservices -- /bin/sh

# Execute a single command
kubectl exec <pod-name> -n microservices -- ls -la

# Connect to MongoDB
kubectl exec -it <mongo-pod-name> -n microservices -- mongosh
```

### Delete Resources

```bash
# Delete specific resource
kubectl delete pod <pod-name> -n microservices
kubectl delete deployment <deployment-name> -n microservices
kubectl delete service <service-name> -n microservices

# Delete all resources from manifests
kubectl delete -f k8s/

# Delete namespace (this deletes everything in it)
kubectl delete namespace microservices
```

### Troubleshooting

```bash
# Describe a resource for detailed information
kubectl describe pod <pod-name> -n microservices
kubectl describe deployment <deployment-name> -n microservices
kubectl describe service <service-name> -n microservices

# Get events
kubectl get events -n microservices --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top nodes
kubectl top pods -n microservices

# View cluster configuration
kubectl config view

# Switch context
kubectl config use-context <context-name>

# Get current context
kubectl config current-context
```

### ConfigMaps and Secrets

```bash
# Create a configmap from file
kubectl create configmap app-config --from-file=config.json -n microservices

# Create a secret
kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password=secret -n microservices

# View configmaps
kubectl get configmaps -n microservices

# View secrets
kubectl get secrets -n microservices

# Describe a secret (values are base64 encoded)
kubectl describe secret db-credentials -n microservices
```

## Development Workflow

### Local Development

```bash
# Install dependencies for each service
cd api-gateway && npm install
cd ../todo-service && npm install
cd ../user-service && npm install

# Run services locally
cd api-gateway && npm start
cd todo-service && npm start
cd user-service && npm start
```

### Build and Deploy Pipeline

```bash
# 1. Build Docker images
docker build -t api-gateway:v1.0 ./api-gateway
docker build -t todo-service:v1.0 ./todo-service
docker build -t user-service:v1.0 ./user-service

# 2. Tag for registry
docker tag api-gateway:v1.0 yourusername/api-gateway:v1.0
docker tag todo-service:v1.0 yourusername/todo-service:v1.0
docker tag user-service:v1.0 yourusername/user-service:v1.0

# 3. Push to registry
docker push yourusername/api-gateway:v1.0
docker push yourusername/todo-service:v1.0
docker push yourusername/user-service:v1.0

# 4. Update Kubernetes deployments
kubectl set image deployment/gateway-service gateway=yourusername/api-gateway:v1.0 -n microservices
kubectl set image deployment/todo-service todo-service=yourusername/todo-service:v1.0 -n microservices
kubectl set image deployment/user-service user-service=yourusername/user-service:v1.0 -n microservices
```

## Monitoring and Logging

```bash
# Install metrics server (if not already installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# View resource usage
kubectl top nodes
kubectl top pods -n microservices

# Stream logs from multiple pods
kubectl logs -f -l app=todo-service -n microservices
```

## Cleanup

```bash
# Stop and delete all resources
kubectl delete -f k8s/

# Stop minikube
minikube stop

# Delete minikube cluster
minikube delete

# Clean up Docker
docker system prune -a --volumes
```

## Useful Links

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

## Notes

- Make sure to update the image names in the Kubernetes deployment files to match your Docker registry
- For production, use proper secrets management and don't commit sensitive data
- Consider using Helm charts for easier deployment management
- Implement proper health checks and resource limits in production

## License

MIT

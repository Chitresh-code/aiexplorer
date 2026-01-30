# Deploying Containers to Azure Container Registry

This guide walks through building the frontend and backend Docker images locally and pushing them to the Azure Container Registry (ACR) `eaihubagent.azurecr.io`. Update values (resource group, subscription, image tags, etc.) to match your environment.

## 1. Prerequisites

1. Azure CLI installed and authenticated (`az login`).
2. Access to the `eaihubagent.azurecr.io` registry with permission to push images.
3. Docker installed locally and running.
4. `.env` files or configuration set up locally if your build requires them.

## 2. Log In to Azure and the Registry

```bash
# Sign in to Azure if not already logged in
az login

# Set subscription (optional)
az account set --subscription "<subscription-id-or-name>"

# Log in to the ACR
az acr login --name eaihubagent
```

## 3. Build and Tag Images

### Backend

```bash
cd backend
docker build --platform linux/amd64 -t backend:latest .
docker tag backend:latest eaihubagent.azurecr.io/aihub-backend:latest
cd ..
```

### Frontend

```bash
cd frontend
docker build --platform linux/amd64 -t aiexplorer:latest .
docker tag aiexplorer:latest eaihubagent.azurecr.io/aiexplorer:latest
cd ..
```

> Consider using semantic or dated tags (e.g., `:v1.2.0`, `:2024-02-15`) instead of `latest` for production deployments.

## 4. Push Images to ACR

```bash
# Backend
docker push eaihubagent.azurecr.io/aihub-backend:latest

# Frontend
docker push eaihubagent.azurecr.io/aiexplorer:latest
```

## 5. Verify Upload

```bash
az acr repository list --name eaihubagent --output table
az acr repository show-tags --name eaihubagent --repository aihub-backend --output table
az acr repository show-tags --name eaihubagent --repository aihub-frontend --output table
```

## 6. Deploy Containers

You can now deploy these images from ACR to your preferred Azure service (App Service, Azure Container Apps, AKS, etc.). Below is an example for Azure Container Apps; adjust as needed.

```bash
RESOURCE_GROUP="<resource-group>"
ENVIRONMENT="<container-app-env>"

az containerapp create \
  --name aihub-backend \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENVIRONMENT" \
  --image eaihubagent.azurecr.io/aihub-backend:latest \
  --target-port 8000 \
  --ingress external \
  --env-vars "DATABASE_URL=<connection-string>" "API_TITLE=AIHub API"

az containerapp create \
  --name aihub-frontend \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENVIRONMENT" \
  --image eaihubagent.azurecr.io/aihub-frontend:latest \
  --target-port 3000 \
  --ingress external
```

Replace `DATABASE_URL`, `API_TITLE`, and other variables with appropriate values. If using App Service or AKS, consult the respective deployment documentation but use the same image references from ACR.

## 7. Automate (Optional)

For repeatable deployments:

- Add CI/CD workflows (GitHub Actions, Azure DevOps) that build, tag, and push images automatically on main branch merges.
- Guard releases with environments or manual approvals.
- Store sensitive configuration (database connection strings, API keys) in Azure Key Vault or Container Apps secrets rather than baking them into images.

---

You now have both backend and frontend images pushed to `eaihubagent.azurecr.io` under separate repositories (`aihub-backend`, `aihub-frontend`) and are ready to deploy them to your preferred Azure compute service.

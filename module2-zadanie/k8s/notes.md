Pliki YAML:
- k8s/postgres-pv-pvc.yaml
- k8s/postgres-deployment.yaml
- k8s/backend-deployment.yaml
- k8s/frontend-config.yaml
- k8s/frontend-deployment.yaml


Pliki aplikacji:
- backend/Dockerfile
- backend/app.py
- backend/requirements.txt
- frontend/index.html
- frontend/nginx.conf


Krok po kroku deploy (skrót):
1. (opcjonalnie) przygotuj katalogi: backend/ i frontend/
2. Zbuduj obraz backend: docker build -t backend-flask:latest backend/
- jeśli używasz minikube: use `eval $(minikube docker-env)` przed budowaniem lub `minikube image load` po zbudowaniu
3. Zaaplikuj PV/PVC: kubectl apply -f k8s/postgres-pv-pvc.yaml
4. Zaaplikuj Postgresa: kubectl apply -f k8s/postgres-deployment.yaml
5. Zaaplikuj backend: kubectl apply -f k8s/backend-deployment.yaml
6. Zaaplikuj frontend config + deployment: kubectl apply -f k8s/frontend-config.yaml && kubectl apply -f k8s/frontend-deployment.yaml


Sprawdzenie:
- kubectl get pods, svc, pvc
- curl http://<node-ip>:30080/
- We frontend: dodaj rekord -> sprawdź, że wyświetla się w /api/list


Git - tworzenie branchy dla każdego pliku (przykład):
- git checkout -b postgres-pv-pvc
- git add k8s/postgres-pv-pvc.yaml
- git commit -m "add postgres pv pvc"
- git push origin postgres-pv-pvc


Powtórz analogicznie dla każdego pliku (jeden plik = jeden branch) zgodnie z wymaganiem zadania.
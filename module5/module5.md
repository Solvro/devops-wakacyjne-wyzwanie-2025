# Moduł 5: Namespace i RBAC – Zarządzanie dostępem i izolacja

---

## Spis treści

1. [Namespace - izolacja zasobów](#namespace---izolacja-zasobów)
2. [Wprowadzenie do RBAC](#wprowadzenie-do-rbac)
3. [ServiceAccount - tożsamość dla aplikacji](#serviceaccount---tożsamość-dla-aplikacji)
4. [Role i ClusterRole - definicja uprawnień](#role-i-clusterrole---definicja-uprawnień)
5. [RoleBinding i ClusterRoleBinding - przypisywanie uprawnień](#rolebinding-i-clusterrolebinding---przypisywanie-uprawnień)
6. [Praktyczne przykłady RBAC](#praktyczne-przykłady-rbac)
7. [Network Policies - izolacja sieciowa](#network-policies---izolacja-sieciowa)
8. [Debugging uprawnień](#debugging-uprawnień)
9. [Podsumowanie](#podsumowanie)
10. [Zadanie](#zadanie)

---

## Namespace - izolacja zasobów

### 🏗️ Definicja

> **Namespace** to mechanizm logicznej **izolacji zasobów** w klastrze Kubernetes. Pozwala na **podział klastra** na wirtualne środowiska dla różnych zespołów, aplikacji lub środowisk.

### 🤔 Problem, który rozwiązuje Namespace

**Bez Namespace:**
- 🔄 **Konflikty nazw** - wszystkie zasoby w jednej przestrzeni
- 🤷 **Brak organizacji** - trudno zarządzać dużą ilością zasobów
- 🔓 **Brak izolacji** - wszyscy mają dostęp do wszystkiego
- 💸 **Brak kontroli kosztów** - nie wiadomo kto ile zużywa

**Z Namespace:**
- ✅ **Logiczna separacja** - każdy zespół/środowisko ma własną przestrzeń
- ✅ **Kontrola dostępu** - można ograniczyć kto co może robić
- ✅ **Resource Quotas** - limity zasobów per namespace
- ✅ **Organizacja** - łatwiejsze zarządzanie zasobami

### 📦 Domyślne Namespace w Kubernetes

```bash
# Lista wszystkich namespace'ów
kubectl get namespaces
# lub krócej
kubectl get ns

# Wynik:
# NAME              STATUS   AGE
# default           Active   10d      # Domyślny namespace
# kube-system       Active   10d      # Systemowe komponenty K8s
# kube-public       Active   10d      # Publiczne zasoby
# kube-node-lease   Active   10d      # Node heartbeat data
```

### 📝 Tworzenie Namespace

#### CLI

```bash
# Utwórz namespace
kubectl create namespace development
kubectl create namespace production
kubectl create namespace testing
```

#### YAML

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    environment: dev
    team: backend
    cost-center: "engineering"
  annotations:
    description: "Development environment for backend team"
    contact: "backend-team@company.com"
    created-by: "platform-team"
spec: {}
---
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: prod
    team: backend
    cost-center: "engineering"
  annotations:
    description: "Production environment"
    contact: "platform-team@company.com"
---
apiVersion: v1
kind: Namespace
metadata:
  name: frontend-dev
  labels:
    environment: dev
    team: frontend
    cost-center: "product"
  annotations:
    description: "Frontend development environment"
    contact: "frontend-team@company.com"
```

### 🎯 Praca z Namespace

```bash
# Ustawienie domyślnego namespace dla sesji
kubectl config set-context --current --namespace=development

# Tworzenie zasobów w konkretnym namespace
kubectl create deployment webapp --image=nginx -n development

# Lista zasobów w konkretnym namespace
kubectl get pods -n development
kubectl get all -n production

# Lista zasobów ze wszystkich namespace'ów
kubectl get pods --all-namespaces
# lub
kubectl get pods -A

# Sprawdzanie zasobów z labelem namespace
kubectl get pods -l environment=dev --all-namespaces
```

### 💰 Resource Quotas - limity zasobów
ResourceQuota i LimitRange pełnią w Kubernetes różne, ale uzupełniające się role. ResourceQuota działa na poziomie całego namespace i określa globalne granice dotyczące liczby obiektów oraz łącznych zasobów, jakie mogą być przydzielone. Dzięki temu administrator może np. ograniczyć liczbę Podów, Service’ów czy ConfigMap w przestrzeni nazw, a także narzucić górny limit całkowitego zużycia CPU, pamięci czy przestrzeni dyskowej przez wszystkie obiekty działające w tym namespace. To podejście zapewnia, że żadna pojedyncza aplikacja czy zespół nie przekroczy dostępnych zasobów w skali całego środowiska.

Z kolei LimitRange działa bardziej precyzyjnie, regulując zasady przydzielania zasobów na poziomie pojedynczego Podu lub kontenera. Definiuje on minimalne i maksymalne wartości CPU oraz pamięci, a także domyślne requests i limits, które zostaną automatycznie zastosowane, jeśli użytkownik ich nie poda. W praktyce oznacza to, że LimitRange chroni przed uruchamianiem zbyt „lekkich” Podów, które mogłyby powodować niestabilność, oraz zbyt „ciężkich”, które mogłyby przeciążyć węzeł.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: development
spec:
  hard:
    # Limity na obiekty
    pods: "10"                          # Max 10 Pod'ów
    services: "5"                       # Max 5 Service'ów
    secrets: "10"                       # Max 10 Secret'ów
    configmaps: "10"                    # Max 10 ConfigMap'ów
    persistentvolumeclaims: "4"         # Max 4 PVC
    
    # Limity zasobów obliczeniowych
    requests.cpu: "2"                   # Max 2 CPU w requests
    requests.memory: "4Gi"              # Max 4GB RAM w requests
    limits.cpu: "4"                     # Max 4 CPU w limits
    limits.memory: "8Gi"                # Max 8GB RAM w limits
    
    # Limity storage
    requests.storage: "50Gi"            # Max 50GB storage
    
    # Limity dla specific storage class
    bronze.storageclass.storage.k8s.io/requests.storage: "20Gi"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: development
spec:
  limits:
  # Domyślne limity dla Pod'ów
  - type: Pod
    max:
      cpu: "1000m"                      # Max CPU per Pod
      memory: "2Gi"                     # Max RAM per Pod
    min:
      cpu: "10m"                        # Min CPU per Pod
      memory: "64Mi"                    # Min RAM per Pod
      
  # Domyślne limity dla kontenerów
  - type: Container
    default:                            # Domyślne limits
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:                     # Domyślne requests
      cpu: "100m"
      memory: "128Mi"
    max:                                # Maksymalne wartości
      cpu: "1000m"
      memory: "1Gi"
    min:                                # Minimalne wartości
      cpu: "10m"
      memory: "32Mi"
```

### 🔍 Monitoring Resource Quotas

```bash
# Sprawdzenie quota w namespace
kubectl get resourcequota -n development
kubectl describe resourcequota dev-quota -n development

# Sprawdzenie użycia zasobów
kubectl top pods -n development
kubectl describe limitrange dev-limits -n development

# Sprawdzenie wszystkich quota w klastrze
kubectl get resourcequota --all-namespaces
```

---

## Wprowadzenie do RBAC

### 🛡️ Definicja

> **RBAC (Role-Based Access Control)** to system autoryzacji w Kubernetes, który pozwala na **kontrolę dostępu** do zasobów klastra na podstawie **ról użytkowników**.

### 🎭 Komponenty RBAC

RBAC składa się z czterech głównych komponentów:

1. **ServiceAccount** - tożsamość dla aplikacji/procesów
2. **Role/ClusterRole** - definicja uprawnień
3. **RoleBinding/ClusterRoleBinding** - przypisanie uprawnień do podmiotów
4. **Subjects** - podmioty (users, groups, service accounts)

### 📊 Różnice: Role vs ClusterRole

| **Aspekt** | **Role** | **ClusterRole** |
|------------|----------|-----------------|
| **Zasięg** | Jeden namespace | Cały klaster |
| **Zasoby** | Zasoby w namespace | Wszystkie zasoby |
| **Użycie** | Lokalne uprawnienia | Globalne uprawnienia |
| **Przykłady** | Dostęp do Pod'ów w dev | Zarządzanie Node'ami |

---

## ServiceAccount - tożsamość dla aplikacji

### 👤 Definicja

> **ServiceAccount** to tożsamość przypisywana **Pod'om i aplikacjom**, która pozwala im na **uwierzytelnianie się** w API Kubernetes i **uzyskiwanie dostępu** do zasobów.

### 🤖 Domyślny ServiceAccount

```bash
# Każdy namespace ma domyślny ServiceAccount
kubectl get serviceaccounts -n development
# NAME      SECRETS   AGE
# default   1         5m

# Szczegóły domyślnego ServiceAccount
kubectl describe serviceaccount default -n development
```

### 📝 Tworzenie ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: webapp-service-account
  namespace: development
  labels:
    app: webapp
    component: backend
  annotations:
    description: "Service account for webapp backend"
automountServiceAccountToken: true      # Automatyczne montowanie tokena
imagePullSecrets:                       # Sekrety do pobierania obrazów
- name: registry-secret
secrets:                                # Dodatkowe sekrety
- name: webapp-secret
```

### 🔗 Używanie ServiceAccount w Pod'ach

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      # Przypisanie ServiceAccount do Pod'ów
      serviceAccountName: webapp-service-account
      
      containers:
      - name: webapp
        image: webapp:latest
        ports:
        - containerPort: 8080
        
        # Token jest automatycznie zamontowany w /var/run/secrets/kubernetes.io/serviceaccount/
        volumeMounts:
        - name: kube-api-access
          mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          readOnly: true
```

### 🔑 Token ServiceAccount

```bash
# Sprawdzenie tokena w Pod'zie
kubectl exec -it webapp-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/token

# Sprawdzenie uprawnień ServiceAccount
kubectl auth can-i get pods --as=system:serviceaccount:development:webapp-service-account

# Testowanie dostępu z wnętrza Pod'a
kubectl exec -it webapp-pod -- sh
# W kontenerze:
APISERVER=https://kubernetes.default.svc
SERVICEACCOUNT=/var/run/secrets/kubernetes.io/serviceaccount
TOKEN=$(cat ${SERVICEACCOUNT}/token)
curl -H "Authorization: Bearer ${TOKEN}" ${APISERVER}/api/v1/namespaces/development/pods
```

---

## Role i ClusterRole - definicja uprawnień
Role i ClusterRole w Kubernetes odpowiadają za nadawanie uprawnień, ale różnią się zakresem swojego działania. Role jest przypisana do konkretnego namespace i pozwala definiować, jakie operacje użytkownicy lub serwisy mogą wykonywać tylko w jego obrębie. Dzięki temu można np. zezwolić developerowi na podglądanie i usuwanie wybranych Podów czy przeglądanie logów aplikacji w namespace development, ale bez dawania mu dostępu do reszty klastra. Role pełni więc funkcję bardziej granularnej kontroli, idealnej do separacji środowisk i zespołów.

ClusterRole ma natomiast charakter globalny i obejmuje cały klaster, niezależnie od namespace. Może nadawać prawa do zasobów typowo klastrowych, takich jak Node’y czy PersistentVolume, ale także definiować uprawnienia, które później można przypisać w dowolnym namespace.

### 🎯 Role - uprawnienia w namespace

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: development                # Tylko w tym namespace
  name: pod-reader
  labels:
    rbac-type: read-only
rules:
# Uprawnienia do Pod'ów
- apiGroups: [""]                       # Core API group (v1)
  resources: ["pods"]
  verbs: ["get", "watch", "list"]       # Operacje tylko do odczytu

# Uprawnienia do logów
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get", "list"]

# Uprawnienia do specific Pod'ów (po nazwie)
- apiGroups: [""]
  resources: ["pods"]
  resourceNames: ["webapp-pod", "api-pod"]  # Tylko te Pod'y
  verbs: ["get", "delete"]
```

### 🌍 ClusterRole - uprawnienia globalne

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
  labels:
    rbac-type: cluster-read
rules:
# Uprawnienia do Node'ów (cluster-wide resource)
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "watch", "list"]

# Uprawnienia do PersistentVolume (cluster-wide)  
- apiGroups: [""]
  resources: ["persistentvolumes"]
  verbs: ["get", "list", "watch"]

# Uprawnienia do metrics
- apiGroups: ["metrics.k8s.io"]
  resources: ["nodes", "pods"]
  verbs: ["get", "list"]
```

### 📋 Standardowe verbs w RBAC

| **Verb** | **Opis** | **HTTP Method** |
|----------|----------|-----------------|
| `get` | Pobieranie pojedynczego zasobu | GET |
| `list` | Pobieranie listy zasobów | GET |
| `watch` | Obserwowanie zmian zasobów | GET (streaming) |
| `create` | Tworzenie nowego zasobu | POST |
| `update` | Aktualizacja istniejącego zasobu | PUT |
| `patch` | Częściowa aktualizacja zasobu | PATCH |
| `delete` | Usuwanie zasobu | DELETE |
| `deletecollection` | Usuwanie kolekcji zasobów | DELETE |
| `*` | Wszystkie operacje | - |

---

## RoleBinding i ClusterRoleBinding - przypisywanie uprawnień

### 🔗 RoleBinding - przypisanie w namespace

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-readers-binding
  namespace: development                # Binding działa tylko w tym namespace
subjects:
# ServiceAccount
- kind: ServiceAccount
  name: webapp-service-account
  namespace: development               # Musi być w tym samym namespace

# User (uwierzytelniany przez zewnętrzny system)
- kind: User
  name: jane.doe@company.com
  apiGroup: rbac.authorization.k8s.io

# Group  
- kind: Group
  name: development-team
  apiGroup: rbac.authorization.k8s.io

roleRef:                               # Referencja do Role lub ClusterRole
  kind: Role                           # Role w tym samym namespace
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 🌐 ClusterRoleBinding - przypisanie globalne

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-readers-binding
subjects:
# ServiceAccount z konkretnego namespace
- kind: ServiceAccount
  name: monitoring-service-account
  namespace: kube-system

# Admin users  
- kind: User
  name: admin@company.com
  apiGroup: rbac.authorization.k8s.io

# Ops team group
- kind: Group  
  name: platform-team
  apiGroup: rbac.authorization.k8s.io

roleRef:                               # Musi być ClusterRole
  kind: ClusterRole
  name: node-reader
  apiGroup: rbac.authorization.k8s.io
```
---

## Przykład 

```yaml
# Namespace dla developerów
apiVersion: v1
kind: Namespace
metadata:
  name: dev-team-app
  labels:
    team: dev
---
# ServiceAccount dla developerów
apiVersion: v1
kind: ServiceAccount
metadata:
  name: developer-sa
  namespace: dev-team-app
---
# Role: może robić wszystko z aplikacją, ale nie może kasować namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev-team-app
  name: developer-role
rules:
# Pełny dostęp do zasobów aplikacyjnych
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets", "persistentvolumeclaims"]
  verbs: ["*"]

- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
  verbs: ["*"]

- apiGroups: ["networking.k8s.io"]  
  resources: ["ingresses", "networkpolicies"]
  verbs: ["*"]

# Może czytać events i logi
- apiGroups: [""]
  resources: ["events", "pods/log", "pods/exec", "pods/portforward"]
  verbs: ["get", "list", "create"]

# NIE MOŻE kasować namespace ani zmieniać quota
---
# RoleBinding przypisuje uprawnienia
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developers-binding
  namespace: dev-team-app
subjects:
- kind: ServiceAccount
  name: developer-sa
  namespace: dev-team-app
- kind: User
  name: john.dev@company.com
  apiGroup: rbac.authorization.k8s.io
- kind: Group
  name: development-team
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer-role
  apiGroup: rbac.authorization.k8s.io
```
---

## Network Policies - izolacja sieciowa

### 🌐 Definicja

> **Network Policy** to mechanizm kontroli **ruchu sieciowego** między Pod'ami w klastrze. Pozwala na tworzenie **firewall'i na poziomie aplikacji**.

⚠️ **Uwaga:** Network Policies wymagają CNI (Container Network Interface) plugin'a, który je wspiera (np. Calico, Cilium, Weave Net).

### 🚫 Domyślna izolacja namespace

```yaml
# Zablokuj cały ruch przychodzący do Pod'ów w namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}                       # Wszystkie Pod'y w namespace
  policyTypes:
  - Ingress                             # Blokuj ruch przychodzący
  - Egress                              # Blokuj ruch wychodzący
---
# Zezwól tylko na ruch wewnętrzny w namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: production
spec:
  podSelector: {}                       # Wszystkie Pod'y
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: production              # Tylko z tego samego namespace
```

### 🎯 Selektywne Network Policies

```yaml
# Policy dla frontend: może rozmawiać z backend i zewnętrznym API
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: frontend                    # Dotyczy tylko frontend Pod'ów
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  # Ruch z load balancer'a/ingress controller'a
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP  
      port: 443
      
  # Ruch z monitoring system'u
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    - podSelector:
        matchLabels:
          app: prometheus
    ports:
    - protocol: TCP
      port: 8080                        # Metrics endpoint

  egress:
  # Może rozmawiać z backend Pod'ami w tym samym namespace
  - to:
    - podSelector:
        matchLabels:
          tier: backend
    ports:
    - protocol: TCP
      port: 8080

  # Może rozmawiać z zewnętrznym API (np. payment gateway)
  - to: []                              # Dowolny external endpoint
    ports:
    - protocol: TCP
      port: 443                         # HTTPS
    - protocol: TCP
      port: 80                          # HTTP
      
  # DNS queries
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
---
# Policy dla backend: tylko frontend może się z nim komunikować
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  # Tylko frontend Pod'y mogą rozmawiać z backend
  - from:
    - podSelector:
        matchLabels:
          tier: frontend
    ports:
    - protocol: TCP
      port: 8080
      
  # Monitoring może sprawdzać health
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080

  egress:
  # Może rozmawiać z bazą danych
  - to:
    - podSelector:
        matchLabels:
          tier: database
    ports:
    - protocol: TCP
      port: 5432                        # PostgreSQL    
  # DNS queries
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
---
# Policy dla bazy danych: najbardziej restryktywna
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  # Tylko backend może się łączyć z DB
  - from:
    - podSelector:
        matchLabels:
          tier: backend
    ports:
    - protocol: TCP
      port: 5432
      
  # Backup system może się łączyć
  - from:
    - namespaceSelector:
        matchLabels:
          name: backup-system
    - podSelector:
        matchLabels:
          app: backup-agent
    ports:
    - protocol: TCP
      port: 5432
```

### 🌍 Cross-namespace communication

```yaml
# Zezwól na komunikację między namespace'ami dev i staging  
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dev-staging-communication
  namespace: development
spec:
  podSelector:
    matchLabels:
      app: webapp
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  # Ruch z staging namespace
  - from:
    - namespaceSelector:
        matchLabels:
          environment: staging
    - podSelector:
        matchLabels:
          app: integration-tests
    ports:
    - protocol: TCP
      port: 8080
      
  egress:
  # Może odpowiadać do staging
  - to:
    - namespaceSelector:
        matchLabels:
          environment: staging
    ports:
    - protocol: TCP
      port: 8080
```

---

## Debugging uprawnień

### 🔍 Sprawdzanie uprawnień

```bash
# Sprawdź czy current user może wykonać operację
kubectl auth can-i create pods
kubectl auth can-i delete services
kubectl auth can-i get secrets -n kube-system

# Sprawdź uprawnienia jako inny user/ServiceAccount
kubectl auth can-i get pods --as=system:serviceaccount:development:webapp-service-account
kubectl auth can-i create deployments --as=jane.doe@company.com --namespace=development

# Sprawdź wszystkie uprawnienia current user'a
kubectl auth can-i --list

# Sprawdź uprawnienia w konkretnym namespace
kubectl auth can-i --list --namespace=development

# Sprawdź uprawnienia ServiceAccount
kubectl auth can-i --list --as=system:serviceaccount:development:webapp-service-account
```

### 📋 Analiza RBAC

```bash
# Lista wszystkich Role w namespace
kubectl get roles -n development
kubectl describe role webapp-manager -n development

# Lista wszystkich ClusterRole
kubectl get clusterroles
kubectl describe clusterrole cluster-admin

# Lista RoleBinding'ów
kubectl get rolebindings -n development
kubectl describe rolebinding developers-binding -n development

# Lista ClusterRoleBinding'ów  
kubectl get clusterrolebindings
kubectl describe clusterrolebinding cluster-admin

# Znajdź wszystkie binding'i dla ServiceAccount
kubectl get rolebindings,clusterrolebindings --all-namespaces -o wide | grep webapp-service-account
```

### 🔧 Narzędzia pomocnicze

```bash
# Zainstaluj kubectl-who-can plugin
kubectl krew install who-can

# Sprawdź kto może wykonać operację
kubectl who-can create pods
kubectl who-can delete secrets -n kube-system
kubectl who-can '*' pods

# Zainstaluj rakkess (przegląd uprawnień)
kubectl krew install access-matrix

# Macierz uprawnień dla current user
kubectl access-matrix
kubectl access-matrix --namespace development
```

---

## Podsumowanie

### 🎯 Kluczowe pojęcia z Modułu 5

- **Namespace** - logiczna izolacja zasobów w klastrze
- **ResourceQuota** - limity zasobów per namespace
- **ServiceAccount** - tożsamość dla aplikacji/Pod'ów
- **Role/ClusterRole** - definicja uprawnień (local vs global)
- **RoleBinding/ClusterRoleBinding** - przypisanie uprawnień do podmiotów
- **Network Policies** - kontrola ruchu sieciowego między Pod'ami


### 💡 Najważniejsze zasady

1. **Principle of Least Privilege** - nadawaj minimalne potrzebne uprawnienia
2. **Separacja środowisk** - różne namespace'y dla dev/staging/prod
3. **Dedykowane ServiceAccounts** - nie używaj domyślnego SA dla aplikacji
4. **Network Policies** - ogranicz komunikację tylko do potrzebnego minimum
5. **Regular audit** - regularnie sprawdzaj kto ma jakie uprawnienia
6. **Documentation** - dokumentuj uprawnienia


## Zadanie

Stwórz kompletną konfigurację RBAC dla aplikacji składającej się z:

### 📋 Wymagania

1. **Namespace'y:**
   - `ecommerce-dev` - środowisko deweloperskie  
   - `ecommerce-prod` - środowisko produkcyjne

2. **Komponenty aplikacji:**
   - `frontend` - React app
   - `backend` - REST API
   - `database` - PostgreSQL

3. **Role i uprawnienia:**
   - **Developer** - pełny dostęp w `dev`, read-only w `prod`
   - **DevOps** - pełny dostęp w obu środowiskach + zarządzanie namespace'ami
   - **App ServiceAccount** - minimalne uprawnienia potrzebne do działania

4. **Network Policies:**
   - Frontend może rozmawiać tylko z backend
   - Backend może rozmawiać z database i frontend  
   - Database nie ma wychodzącego ruchu (poza DNS)

### 📝 Co oddać ?

Stwórz następujące pliki:

1. `namespaces.yaml` - definicje namespace'ów z ResourceQuota
2. `serviceaccounts.yaml` - ServiceAccounts dla aplikacji
3. `rbac-dev.yaml` - Role i RoleBindings dla developerów
4. `rbac-devops.yaml` - ClusterRole i Bindings dla DevOps
5. `rbac-apps.yaml` - Role dla aplikacji (minimalne uprawnienia)
6. `network-policies.yaml` - Network Policies dla izolacji sieciowej

Wysyłamy rozwiązanie na swojego brancha w repo! 🚀

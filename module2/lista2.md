# Moduł 2: Podstawowe obiekty w Kubernetes

---

## Spis treści

1. [Pod - najmniejsza jednostka w Kubernetes](#pod---najmniejsza-jednostka-w-kubernetes)
2. [ReplicaSet - zarządzanie replikami](#replicaset---zarządzanie-replikami)
3. [Deployment - inteligentne wdrożenia](#deployment---inteligentne-wdrożenia)
4. [Service - komunikacja między Podami](#service---komunikacja-między-podami)
5. [Volume - trwałe przechowywanie danych](#volume---trwałe-przechowywanie-danych)
6. [Labele i selektory - organizacja zasobów](#labele-i-selektory---organizacja-zasobów)
7. [Podsumowanie](#podsumowanie)
9. [Zadania](#zadania-do-treningu)

---

## Pod - najmniejsza jednostka w Kubernetes

### 🏗️ Definicja

> **Pod** to **najmniejsza jednostka wdrażania** w Kubernetes. To opakowanie dla jednego lub więcej kontenerów, które dzielą zasoby sieciowe i storage.

### 🔍 Charakterystyka Pod'a

**Pod zawiera:**
- ✅ **Jeden lub więcej kontenerów** (najczęściej jeden)
- ✅ **Współdzieloną przestrzeń sieciową** (jeden IP)
- ✅ **Współdzielone volumes**
- ✅ **Specyfikację zasobów** (CPU, RAM)

**Ważne właściwości:**
- 💡 **Kontenery w Pod'zie** komunikują się przez `localhost`
- 💡 **Cały Pod** ma jeden adres IP
- 💡 **Pod jest efemeryczny** -mogą zostać w dowolnej chwili usunięte, przeniesione lub ponownie utworzone przez kontroler (Deployment, ReplicaSet, StatefulSet itp.).
- 💡 **Skalowanie** odbywa się przez tworzenie kolejnych Pod'ów

### 📝 Przykład Pod'a w YAML - szczegółowy opis

```yaml
# Określa wersję API Kubernetes - v1 to podstawowe API
apiVersion: v1
# Typ obiektu - Pod to najmniejsza jednostka w K8s
kind: Pod
# Metadane obiektu - informacje opisowe
metadata:
  # Unikalna nazwa Pod'a w namespace (maks 253 znaki)
  name: nginx-pod
  # Opcjonalne labele - klucz:wartość do organizacji zasobów
  labels:
    # Label identyfikujący aplikację - używany przez Service'y
    app: nginx
    # Label określający warstwę aplikacji
    tier: frontend
    # Label określający wersję - przydatny przy aktualizacjach
    version: "1.21"
    # Label określający środowisko
    environment: production
# Specyfikacja Pod'a - definicja jak ma działać
spec:
  # Lista kontenerów w Pod'zie (zwykle jeden)
  containers:
  # Pierwszy kontener
  - name: nginx-container          # Nazwa kontenera w Pod'zie
    image: nginx:latest            # Obraz Docker - tag latest nie jest zalecany w produkcji
    # Lista portów eksponowanych przez kontener
    ports:
    - containerPort: 80            # Port na którym aplikacja nasłuchuje
      name: http                   # Opcjonalna nazwa portu
      protocol: TCP                # Protokół (TCP/UDP/SCTP)
    # Limity zasobów - ważne dla stabilności klastra
    resources:
      # Requests - minimalne zasoby potrzebne do uruchomienia
      requests:
        cpu: 100m                  # 100 milicpu = 0.1 CPU core
        memory: 128Mi              # 128 MebiByte RAM
      # Limits - maksymalne zasoby które kontener może użyć
      limits:
        cpu: 500m                  # 500 milicpu = 0.5 CPU core
        memory: 512Mi              # 512 MebiByte RAM - po przekroczeniu Pod zostanie zabity
    # Zmienne środowiskowe
    env:
    - name: NGINX_PORT             # Nazwa zmiennej
      value: "80"                  # Wartość (zawsze string w YAML)
    - name: ENVIRONMENT
      value: "production"
```

---

## ReplicaSet - zarządzanie replikami

### ⚖️ Definicja

> **ReplicaSet** zapewnia, że określona liczba identycznych Pod'ów **zawsze działa** w klastrze. To kontroler odpowiedzialny za **utrzymanie pożądanego stanu**.

### 💪 Możliwości ReplicaSet

- 🔄 **Automatyczne odtwarzanie** Pod'ów po awarii
- 📊 **Utrzymywanie określonej liczby replik**
- 🎯 **Selekcja Pod'ów** na podstawie labeli
- 🚀 **Podstawa dla Deployment'ów**

### 📝 Przykład ReplicaSet w YAML - szczegółowy opis

```yaml
# API dla kontrolerów workload
apiVersion: apps/v1
# Typ kontrolera zarządzającego replikami
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
    controller: replicaset
spec:
  # Pożądana liczba replik Pod'ów
  replicas: 3
  # Selector określa które Pod'y należą do tego ReplicaSet
  selector:
    # Proste dopasowanie po labelach
    matchLabels:
      app: nginx                   # Musi być identyczne z template.metadata.labels
      tier: frontend
  # Template definiuje jak mają wyglądać tworzone Pod'y
  template:
    # Metadane dla tworzonych Pod'ów
    metadata:
      labels:
        app: nginx                 # MUSI odpowiadać selector.matchLabels
        tier: frontend
        created-by: replicaset     # Dodatkowy label dla identyfikacji
    # Specyfikacja Pod'ów identyczna jak w definicji Pod
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
       
```


---

## Deployment - inteligentne wdrożenia

### 🚀 Definicja

> **Deployment** to zaawansowany kontroler, który **zarządza ReplicaSets** i zapewnia **deklaratywne aktualizacje** aplikacji bez przestoju.


### ✨ Zalety Deployment 

- 🔄 **Rolling updates** - aktualizacje bez przestoju
- ⏪ **Rollback** - powrót do poprzedniej wersji
- 📈 **Skalowanie** - łatwa zmiana liczby replik
- 📊 **Historia wersji** - śledzenie zmian
- 🎯 **Deklaratywne zarządzanie** - opisz stan docelowy

### 📝 Przykład Deployment w YAML - szczegółowy opis

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
  # Adnotacje - metadane nie używane przez selektory
  annotations:
    deployment.kubernetes.io/revision: "1"  # Wersja deployment
    kubernetes.io/change-cause: "Initial deployment"  # Przyczyna zmiany
spec:
  # Liczba replik (jak w ReplicaSet)
  replicas: 3
  # Strategia aktualizacji Pod'ów
  strategy:
    type: RollingUpdate            # RollingUpdate lub Recreate
    rollingUpdate:
      maxUnavailable: 1            # Ile Pod'ów może być niedostępnych podczas update
      maxSurge: 1                  # Ile dodatkowych Pod'ów można utworzyć podczas update
  # Historia poprzednich ReplicaSet (dla rollback)
  revisionHistoryLimit: 10         # Ile poprzednich wersji zachować
  # Selector jak w ReplicaSet
  selector:
    matchLabels:
      app: nginx
  # Template Pod'ów
  template:
    metadata:
      labels:
        app: nginx
        version: "1.21"
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
          name: http
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        
```

### 🔄 Strategie wdrażania

**1. RollingUpdate (domyślna)**
- Stopniowa wymiana Pod'ów
- Zero downtime
- Kontrolowana przez `maxUnavailable` i `maxSurge`

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 25%          # Może być % lub liczba
      maxSurge: 25%                # Może być % lub liczba
```

**2. Recreate**
- Usuwa wszystkie Pod'y, następnie tworzy nowe
- Krótki downtime
- Szybsze dla aplikacji, które nie obsługują równoczesnych wersji

```yaml
spec:
  strategy:
    type: Recreate               # Usuń wszystkie Pod'y, potem utwórz nowe
```

---

## Service - komunikacja między Podami

### 🌐 Definicja

> **Service** to abstrakcja, która **definiuje logiczny zestaw Pod'ów** i politykę dostępu do nich. Rozwiązuje problem **dynamicznych IP Pod'ów**.

### 🤔 Problem, który rozwiązuje Service

Bez Service:
- 🔄 Pod'y mają **dynamiczne IP** (zmienia się przy restarcie)
- 📍 **Jak połączyć frontend z backendem?**
- ⚖️ **Jak zrobić load balancing** między replikami?
- 🔍 **Service discovery** - jak znajdować usługi?

Z Service:
- ✅ **Stały DNS** dla aplikacji
- ✅ **Load balancing** między Pod'ami
- ✅ **Service discovery** przez DNS
- ✅ **Abstakcja** od konkretnych Pod'ów

### 🎯 Typy Service

Kubernetes oferuje kilka typów Service'ów, każdy z różnym przeznaczeniem:

| **Characteristic** | **ClusterIP** | **NodePort** | **LoadBalancer** | **Headless** |
|-------------------|---------------|--------------|------------------|--------------|
| **Accessibility** | Internal | External | External | Internal |
| **Use case** | Expose Pods to other Pods in your cluster | Expose Pods on a specific Port of each Node | Expose Pods using a cloud load balancer resource | Interface with external service discovery systems |
| **Suitable for** | Internal communications between workloads | Accessing workloads outside the cluster, for one-off or development use | Serving publicly accessible web apps and APIs in production | Advanced custom networking that avoids automatic Kubernetes proxying |
| **Client connection type** | Stable cluster-internal IP address or DNS name | Port on Node IP address | IP address of external load balancer | Stable-cluster internal IP address or DNS name that also enables DNS resolution of the Pod IPs behind the Service |
| **External dependencies** | None | Free port on each Node | A Load Balancer component (typically billable by your cloud provider) | None |

#### 1. ClusterIP (domyślny) - szczegółowy opis

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  labels:
    app: nginx
    service-type: internal
spec:
  # Domyślny typ - dostępny tylko wewnątrz klastra
  type: ClusterIP
  # Opcjonalnie można określić konkretny IP z puli ClassterIP
  # clusterIP: 10.96.0.100
  # Selector określa które Pod'y obsługuje ten Service
  selector:
    app: nginx                     # Musi odpowiadać labelom Pod'ów
  ports:
  - name: http                     # Nazwa portu (opcjonalna)
    port: 80                       # Port na którym Service nasłuchuje
    targetPort: 80                 # Port na Pod'zie (może być nazwa z containerPort)
    protocol: TCP                  # TCP, UDP lub SCTP
  # Sesja affinity - czy kierować tego samego klienta do tego samego Pod'a
  sessionAffinity: None            # None lub ClientIP
```

**Charakterystyka:**
- 🔒 **Dostęp tylko z wnętrza klastra**
- 🎯 **Idealny dla komunikacji między serwisami**
- 🌐 **DNS**: `nginx-service.default.svc.cluster.local`

#### 2. NodePort - szczegółowy opis

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - port: 80                       # Port Service'u (wewnętrzny)
    targetPort: 80                 # Port aplikacji w Pod'zie
    nodePort: 30080                # Port na każdym Node (30000-32767)
    protocol: TCP
  # Czy używać zewnętrznego load balancer dla ruchu
  externalTrafficPolicy: Cluster   # Cluster lub Local
```

**Charakterystyka:**
- 🌍 **Dostęp z zewnątrz** przez `<NodeIP>:<NodePort>`
- 🎲 **Port w zakresie 30000-32767**
- 🔧 **Przydatny do testowania**

#### 3. LoadBalancer - szczegółowy opis

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
  annotations:
    # Adnotacje specyficzne dla dostawcy chmury
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
  # Opcjonalne - dozwolone źródła ruchu
  loadBalancerSourceRanges:
  - 192.168.1.0/24                 # Tylko z tej sieci
  - 10.0.0.0/8
```

**Charakterystyka:**
- ☁️ **Wymaga środowiska chmurowego** (AWS, GCP, Azure)
- 🌐 **Automatycznie tworzy zewnętrzny load balancer**
- 💰 **Kosztowny** - każdy LoadBalancer to oddzielny zasób w chmurze
- 🏢 **Idealny do produkcji** w chmurze

#### 4. Headless Service - szczegółowy opis

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
spec:
  clusterIP: None                  # To czyni Service headless
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
# DNS będzie zwracać IP wszystkich Pod'ów zamiast IP Service'u
# Używane przez StatefulSet do stałych nazw Pod'ów
```

**Charakterystyka:**
- 🔍 **Brak load balancingu** - bezpośredni dostęp do IP Pod'ów
- 🌐 **DNS zwraca IP wszystkich Pod'ów**
- ⚡ **Używany przez StatefulSets** i bazy danych
- 🎯 **Zaawansowane scenariusze** gdzie potrzebujemy kontroli nad routing'iem

### 🌐 Service bez selektora (dla zewnętrznych usług)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-database
spec:
  ports:
  - port: 3306
    targetPort: 3306
# Brak selector - trzeba ręcznie utworzyć Endpoints
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-database          # Musi odpowiadać nazwie Service
subsets:
- addresses:
  - ip: 192.168.1.100             # IP zewnętrznej bazy danych
  ports:
  - port: 3306
```


---

## Volume - trwałe przechowywanie danych

### 💾 Problem z danymi w Pod'ach

**Bez Volumes:**
- 🚮 **Dane giną** przy restarcie Pod'a
- 💔 **Brak współdzielenia** danych między kontenerami
- 🔄 **Aplikacje stanowe** nie działają poprawnie

**Z Volumes:**
- ✅ **Trwałe przechowywanie** danych
- ✅ **Współdzielenie** między kontenerami
- ✅ **Różne typy storage** (dysk, NFS, cloud storage)


### 🗂️ Typy Volume

### emptyDir - tymczasowe storage

**Do czego służy:**
- Współdzielenie danych między kontenerami w tym samym Podzie
- Tymczasowe przechowywanie plików (cache, logi, pliki robocze)
- Dane są usuwane wraz z Podem
- Storage jest tworzony na węźle gdzie działa Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql-with-cache
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password123"
    volumeMounts:
    - name: shared-cache
      mountPath: /var/cache/mysql
  - name: cache-warmer
    image: busybox
    command: ['sh', '-c', 'while true; do echo "Cache entry $(date)" >> /cache/warm.log; sleep 60; done']
    volumeMounts:
    - name: shared-cache
      mountPath: /cache
  volumes:
  - name: shared-cache
    emptyDir: {}
```

### hostPath - katalog z węzła

**Do czego służy:**
- Dostęp do plików/katalogów z węzła Kubernetes
- Monitoring, logi systemowe
- Współdzielenie konfiguracji z hostem


```yaml
volumes:
- name: mysql-host-data
  hostPath:
    path: /opt/mysql-data        # Katalog na węźle
    type: DirectoryOrCreate      # Utwórz jeśli nie istnieje
- name: mysql-config
  hostPath:
    path: /etc/mysql/my.cnf     # Plik konfiguracyjny z hosta
    type: File                   # Musi być plikiem
```

###  PersistentVolumeClaim


**Do czego służy:**
- Trwałe przechowywanie danych (przeżywa restart/usunięcie Poda)
- Niezależne od cyklu życia Poda
- Może być współdzielone między Podami
- Zarządzane przez administratora klastra lub dynamicznie

#### Przykład PVC - szczegółowy opis

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  labels:
    app: mysql
spec:
  # Tryby dostępu do woluminu
  accessModes:
  - ReadWriteOnce                  # RWO - jeden Node, read-write
  # - ReadOnlyMany                 # ROX - wiele Node'ów, read-only  
  # - ReadWriteMany                # RWX - wiele Node'ów, read-write
  resources:
    requests:
      storage: 20Gi                # 20GB dla danych MySQL
  # Opcjonalnie - konkretna klasa storage
  storageClassName: fast-ssd       # Szybkie dyski SSD dla bazy
  # Opcjonalnie - selector dla konkretnego PV
  selector:
    matchLabels:
      tier: database               # Tylko PV oznaczone jako database
      performance: high
```

#### Pod z PVC

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql-server
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "securePassword123"
    - name: MYSQL_DATABASE
      value: "myapp"
    ports:
    - containerPort: 3306
    volumeMounts:
    - name: mysql-data             # dane MySQL
      mountPath: /var/lib/mysql
  volumes:
  - name: mysql-data               # Trwałe dane
    persistentVolumeClaim:
      claimName: mysql-pvc
      readOnly: false
```

## 📋 Podsumowanie zastosowań:

- **emptyDir**: Cache, tymczasowe pliki, komunikacja między kontenerami
- **hostPath**: Dostęp do plików systemowych, konfiguracji hosta  
- **PVC/PV**: Trwałe dane aplikacji, bazy danych, pliki użytkowników


## Labele i selektory - organizacja zasobów

### 🏷️ Definicja

> **Labele** to **klucz-wartość** pary przypisane do obiektów Kubernetes. **Selektory** to sposób na **wybieranie obiektów** na podstawie labeli.

### 🎯 Zastosowania labeli

- 🔗 **Łączenie Service z Pod'ami**
- 🎛️ **Organizacja zasobów** (środowisko, wersja, zespół)
- 🔍 **Filtrowanie** w kubectl
- 📊 **Monitoring i logging**
- 🚀 **Deployment targeting**

### 📝 Przykłady labeli

```yaml
metadata:
  name: nginx-pod
  labels:
    app: nginx
    version: "1.21"
    environment: production
    tier: frontend
    owner: team-alpha
```

### 🔍 Typy selektorów

#### 1. Equality-based selectors

```bash
# Pod'y z app=nginx
kubectl get pods -l app=nginx

# Pod'y z app=nginx I environment=production
kubectl get pods -l app=nginx,environment=production

# Pod'y BEZ labela environment
kubectl get pods -l '!environment'
```

#### 2. Set-based selectors

```bash
# Pod'y gdzie environment IN (dev,test)
kubectl get pods -l 'environment in (dev,test)'

# Pod'y gdzie environment NOT IN (production)
kubectl get pods -l 'environment notin (production)'

# Pod'y które MAJĄ label tier
kubectl get pods -l tier
```

### 📄 Selektory w YAML (matchLabels vs matchExpressions)

```yaml
# matchLabels (prostszy)
selector:
  matchLabels:
    app: nginx
    tier: frontend

# matchExpressions (bardziej elastyczny)
selector:
  matchExpressions:
  - key: app
    operator: In
    values: ["nginx", "apache"]
  - key: tier
    operator: NotIn
    values: ["database"]
```



---

## Podsumowanie

###  Kluczowe pojęcia z Modułu 2

- **Pod** - najmniejsza jednostka, opakowanie dla kontenerów
- **ReplicaSet** - utrzymuje określoną liczbę Pod'ów 
- **Deployment** - inteligentny kontroler z rolling updates i rollback
- **Service** - zapewnia stałą komunikację między Pod'ami
- **PVC/PV** - trwałe przechowywanie danych
- **Labele** - organizacja i selekcja zasobów



## Zadania do treningu


### 🎯 Zadanie 1: Self healing

1. **Stwórz ReplicaSet** z 3 replikami nginx
2. **Usuń jeden Pod** i obserwuj samoleczenie


### 🎯 Zadanie 2: Service Discovery

1. **Stwórz Deployment** z aplikacją (np. nginx)
2. **Stwórz Service ClusterIP** dla aplikacji
3. **Stwórz Pod testowy** (busybox) i sprawdź:
- Czy możesz połączyć się z Service przez DNS
- Jakie IP mają Pod'y z aplikacją nginx


### 🎯 Zadanie 3: Trwały storage dla bazy danych

1. **Stwórz PersistentVolumeClaim (PVC)**  
-Zarezerwuj trwałe miejsce na dysku dla bazy danych.

2. **Stwórz Pod bazy danych** używający PVC  
-Np. MySQL lub PostgreSQL, montując PVC jako katalog danych.

3. **Dodaj przykładowe dane** w bazie (np. tabelę lub rekord).

4. **Stwórz ponownie pod bazy danych** i sprawdź, czy dane nadal istnieją  




### 🎯 Zadanie 4: Labele
1. **Stwórz testowe deploymenty** i dodaj labele dla jednego prod dla drugiego dev
2. **Przećwicz filtrowanie** zasobów po labelach
3. **W k9s** użyj filtrów do wyświetlenia tylko zasobów produkcyjnych

## Zadanie główne

Zadanie polega na deploymencie prostej apki (front+back+baza) z użyciem poznanych w tym module obiektów K8s.
Aplikacja nie jest głównym celem tego zadania więc tutaj macie pełną dowolnść: co, skąd, w jakim języku - byle umożliwiała zapis do/odczyt z bazy danych. Sprawdzane będą tylko i wyłącznie pliki yaml które należy przesłać na githuba (każdy na swojego brancha).

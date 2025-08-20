# Moduł 3: Konfiguracja Aplikacji i Monitorowanie Jej Stanu

---

## Spis treści

1. [ConfigMap - zarządzanie konfiguracją](#configmap---zarządzanie-konfiguracją)
2. [Secret - bezpieczne przechowywanie danych wrażliwych](#secret---bezpieczne-przechowywanie-danych-wrażliwych)
3. [Montowanie konfiguracji - zmienne i wolumeny](#montowanie-konfiguracji---zmienne-i-wolumeny)
4. [Health Checks - probe'y w Kubernetes](#health-checks---probey-w-kubernetes)
5. [Debugging aplikacji w klastrze](#debugging-aplikacji-w-klastrze)
6. [Podsumowanie](#podsumowanie)
7. [Zadanie](#zadanie)

---

## ConfigMap - zarządzanie konfiguracją

### ⚙️ Definicja

> **ConfigMap** to obiekt Kubernetes służący do **przechowywania konfiguracji** aplikacji w postaci par **klucz-wartość**. Oddziela konfigurację od kodu aplikacji.

### 🤔 Problem, który rozwiązuje ConfigMap

**Bez ConfigMap:**
- 🔒 **Konfiguracja w kodzie** - trudne zmiany bez rebuildu
- 🏗️ **Różne obrazy** dla różnych środowisk
- 📦 **Hardkodowane wartości** w Dockerfile
- 🔄 **Restart aplikacji** przy każdej zmianie konfiguracji

**Z ConfigMap:**
- ✅ **Zewnętrzna konfiguracja** - bez przebudowy obrazu
- ✅ **Ten sam obraz** na dev, test, prod
- ✅ **Dynamiczne zmiany** konfiguracji
- ✅ **Centralne zarządzanie** konfiguracją

### 📝 ConfigMap - szczegółowy opis 

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webapp-config
  labels:
    app: webapp
    config-type: application
    environment: production
  # Adnotacje dla dodatkowych metadanych
  annotations:
    config.kubernetes.io/description: "Main application configuration"
    config.kubernetes.io/last-updated: "2024-01-15T10:30:00Z"
data:
  # Proste pary klucz-wartość
  DATABASE_URL: "postgresql://postgres:5432/webapp"
  LOG_LEVEL: "INFO"
  MAX_CONNECTIONS: "50"
  CACHE_TTL: "3600"
  DEBUG_MODE: "false"
  
  # Pliki konfiguracyjne jako wartości
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        
    }
  
  # Plik JSON z konfiguracją
  app-config.json: |
    {
      "database": {
        "host": "postgres",
        "port": 5432,
        "name": "webapp",
        "ssl": false
      }
    }

  # YAML configuration
  logging.yaml: |
    version: 1
    formatters:
      default:
        format: '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    handlers:
      console:
        class: logging.StreamHandler
        level: INFO
        formatter: default
        stream: ext://sys.stdout
```

---

## Secret - bezpieczne przechowywanie danych wrażliwych

### 🔐 Definicja

> **Secret** to obiekt podobny do ConfigMap, ale **przeznaczony dla danych wrażliwych** jak hasła, klucze API, certyfikaty. Dane są zakodowane w **base64**.

### 🛡️ Różnice między ConfigMap a Secret

| **Aspekt** | **ConfigMap** | **Secret** |
|------------|---------------|------------|
| **Przeznaczenie** | Zwykła konfiguracja | Dane wrażliwe |
| **Kodowanie** | Plain text | Base64 |
| **Widoczność** | Widoczne w kubectl | Ukryte domyślnie |
| **Montowanie** | 644 permissions | 400 permissions |
| **Przykłady** | URLs, porty, flagi | Hasła, klucze, certyfikaty |

### 🔑 Typy Secret

Kubernetes oferuje kilka typów Secret:

- `Opaque` - ogólne dane (domyślny)
- `kubernetes.io/service-account-token` - tokeny service account
- `kubernetes.io/dockercfg` - dane Docker registry (stary format)
- `kubernetes.io/dockerconfigjson` - dane Docker registry (nowy format)
- `kubernetes.io/basic-auth` - basic authentication
- `kubernetes.io/ssh-auth` - SSH authentication
- `kubernetes.io/tls` - certyfikaty TLS

### 📝 Secret - szczegółowy opis 

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: webapp-secrets
  labels:
    app: webapp
    secret-type: credentials
type: Opaque
data:
  # Wszystkie wartości MUSZĄ być w base64
  # echo -n 'admin' | base64 = YWRtaW4=
  username: YWRtaW4=
  # echo -n 'superSecretPassword123' | base64
  password: c3VwZXJTZWNyZXRQYXNzd29yZDEyMw==
  # echo -n 'sk-1234567890abcdef' | base64
  api-key: c2stMTIzNDU2Nzg5MGFiY2RlZg==
  
  # Klucz SSH (base64)
  ssh-key: LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K...

# Alternatywnie - stringData (automatyczne kodowanie base64)
stringData:
  # Kubernetes automatycznie zakoduje te wartości do base64
  database-url: "postgresql://admin:superSecretPassword123@postgres:5432/webapp"
  smtp-password: "email_password_123"
  jwt-secret: "my-super-secret-jwt-key"
---
# Secret TLS dla HTTPS
apiVersion: v1
kind: Secret
metadata:
  name: webapp-tls
type: kubernetes.io/tls
data:
  # Certyfikat TLS (base64)
  tls.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t...
  # Klucz prywatny TLS (base64)  
  tls.key: LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...
```

### Dekodowanie secret'ów

```bash
# Pobranie Secret i dekodowanie
kubectl get secret webapp-secrets -o jsonpath='{.data.password}' | base64 --decode

```

---

## Montowanie konfiguracji - zmienne i wolumeny

### 🔗 Sposoby używania ConfigMap i Secret

Kubernetes oferuje kilka sposobów na wykorzystanie konfiguracji:

1. **Zmienne środowiskowe** - pojedyncze wartości lub wszystkie klucze
2. **Wolumeny** - pliki konfiguracyjne w systemie plików
3. **Kombinacja obu** - według potrzeb aplikacji

### 💡 Zmienne środowiskowe

#### 1. Pojedyncza zmienna z ConfigMap

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-env
spec:
  containers:
  - name: webapp
    image: nginx:latest
    env:
    # Pojedyncza zmienna z ConfigMap
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: webapp-config          # Nazwa ConfigMap
          key: DATABASE_URL            # Klucz w ConfigMap
    
    # Pojedyncza zmienna z Secret  
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: webapp-secrets         # Nazwa Secret
          key: password               # Klucz w Secret
    
    # Normalna zmienna środowiskowa
    - name: APP_VERSION
      value: "1.0.0"
```

#### 2. Wszystkie klucze jako zmienne środowiskowe

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-envfrom
spec:
  containers:
  - name: webapp
    image: webapp:latest
    envFrom:
    # Wszystkie klucze z ConfigMap jako zmienne środowiskowe
    - configMapRef:
        name: webapp-config
    
    # Wszystkie klucze z Secret jako zmienne środowiskowe    
    - secretRef:
        name: webapp-secrets
        
    # Opcjonalnie - prefix dla zmiennych
    - prefix: CONFIG_
      configMapRef:
        name: webapp-config
```

### 📁 Montowanie jako wolumeny

#### 1. ConfigMap jako volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-volume
spec:
  containers:
  - name: webapp
    image: webapp:latest
    volumeMounts:
    # Cały ConfigMap jako katalog
    - name: config-volume 1️⃣
      mountPath: /etc/config          # Katalog w kontenerze
      readOnly: true
    
    # Pojedynczy plik z ConfigMap
    - name: nginx-config 2️⃣
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf             # Konkretny klucz z ConfigMap
      readOnly: true
      
    # Secret jako volume
    - name: secret-volume 3️⃣
      mountPath: /etc/secrets
      readOnly: true
      
  volumes:
  # Cały ConfigMap
  - name: config-volume 1️⃣
    configMap:
      name: webapp-config
      # Opcjonalnie - uprawnienia plików
      defaultMode: 0644
      
  # Pojedynczy plik z ConfigMap
  - name: nginx-config 2️⃣
    configMap:
      name: webapp-config
      items:
      - key: nginx.conf               # Klucz w ConfigMap
        path: nginx.conf              # Nazwa pliku w volume
        mode: 0644                    # Uprawnienia pliku
        
  # Secret jako volume
  - name: secret-volume 3️⃣
    secret:
      secretName: webapp-secrets
      defaultMode: 0400               # Restrictive permissions for secrets
```

#### 2. Zaawansowane montowanie z projectedVolume
Jest to przydatne, kiedy chcemy mieć np. w /etc/config wszystkie ustawienia: część z ConfigMap a część z Secret.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-projected
spec:
  containers:
  - name: webapp
    image: webapp:latest
    volumeMounts:
    - name: combined-config
      mountPath: /etc/combined
      readOnly: true
      
  volumes:
  # Kombinacja ConfigMap i Secret w jednym volume
  - name: combined-config
    projected:
      sources:
      # Pliki z ConfigMap
      - configMap:
          name: webapp-config
          items:
          - key: app-config.json
            path: config/app.json
            
      # Pliki z Secret      
      - secret:
          name: webapp-secrets
          items:
          - key: api-key
            path: secrets/api.key
            mode: 0400
            
      # Service Account token
      - serviceAccountToken:
          path: token
          expirationSeconds: 3600
```

---

## Health Checks - probe'y w Kubernetes

### 💓 Definicja

> **Health Checks** to mechanizmy w Kubernetes służące do **monitorowania stanu aplikacji**. Pozwalają na automatyczne wykrywanie problemów i reagowanie na nie.

### 🎯 Typy probe'ów

Kubernetes oferuje trzy typy probe'ów:

1. **livenessProbe** - "Czy aplikacja żyje?"
2. **readinessProbe** - "Czy aplikacja gotowa na ruch?"  
3. **startupProbe** - "Czy aplikacja się uruchomiła?"

### 📊 różnice probe'ów

| **Probe** | **Co sprawdza?** | **Efekt przy porażce** |
|-----------|------------------|------------------------|
| **startupProbe** | Czy aplikacja poprawnie się uruchomiła | Restart Pod'a, jeśli nie wystartuje w określonym czasie |
| **livenessProbe** | Czy aplikacja nadal działa | Restart Pod'a |
| **readinessProbe** | Czy aplikacja może obsługiwać ruch | Pod oznaczony jako NotReady → nie dostaje requestów |

### 🔄 livenessProbe - Probe żywotności

**Zadanie:** Sprawdza czy aplikacja *żyje*
**Akcja:** Restart kontenera jeśli probe nie przechodzi

🔹 **Charakterystyka livenessProbe:**
- Sprawdza, czy proces jest **w zdrowym stanie**
- Jeśli `livenessProbe` zawiedzie, kubelet **restartuje kontener**
- Dzięki temu Pod może "sam się uleczyć", jeśli np. proces się zawiesi, deadlockuje albo nie odpowiada

👉 **Typowy use case:**
- Endpoint `/health` sprawdza np. podstawowe funkcje, czy proces odpowiada
- Jeśli 3 próby co 30 sekund się nie powiodą → restart

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-liveness
spec:
  containers:
  - name: webapp
    image: webapp:latest
    ports:
    - containerPort: 8080
    
    livenessProbe:
      # HTTP GET probe
      httpGet:
        path: /health                 # Endpoint health check
        port: 8080                    # Port aplikacji
        scheme: HTTP                  # HTTP lub HTTPS
        httpHeaders:                  # Opcjonalne nagłówki
        - name: Custom-Header
          value: liveness
          
      initialDelaySeconds: 30         # Czekaj 30s po starcie kontenera
      periodSeconds: 10               # Sprawdzaj co 10 sekund
      timeoutSeconds: 5               # Timeout dla pojedynczego probe
      failureThreshold: 3             # Ile niepowodzeń przed restartem
      successThreshold: 1             # Ile sukcesów by uznać za zdrowy
```

#### Przykład aplikacji z liveness endpoint

```bash
# Przykładowy endpoint /health w aplikacji
curl http://webapp:8080/health
# Odpowiedź: {"status": "healthy", "timestamp": "2024-01-15T10:30:00Z"}
```

### ✅ readinessProbe - Probe gotowości

**Zadanie:** Sprawdza czy aplikacja jest gotowa przyjmować ruch
**Akcja:** Usuwa Pod z Service endpoints (nie restart!)

🔹 **Charakterystyka readinessProbe:**
- Określa, czy Pod może być włączony do **Service / Load Balancera**
- Jeśli `readinessProbe` zawiedzie, Pod zostaje oznaczony jako **NotReady** i **przestaje dostawać ruch**, ale **nie jest restartowany**
- Używa się jej np. gdy aplikacja:
  - musi się rozgrzać
  - czeka na zewnętrzny serwis (DB, API)
  - przechodzi chwilowy stan niedostępności (np. GC, reindeksacja)

👉 **Typowy use case:** Aplikacja jest żywa, ale nie może jeszcze obsługiwać requestów

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp-readiness
spec:
  containers:
  - name: webapp
    image: webapp:latest
    ports:
    - containerPort: 8080
    
    readinessProbe:
      httpGet:
        path: /ready                  # Endpoint sprawdzający gotowość
        port: 8080
        
      initialDelaySeconds: 10         # Szybciej niż liveness
      periodSeconds: 5                # Częściej niż liveness  
      timeoutSeconds: 3
      failureThreshold: 3            
      successThreshold: 1             
```
### 🚀 startupProbe - Probe uruchomienia

**Zadanie:** Sprawdza czy aplikacja w ogóle wystartowała
**Akcja:** Restart Pod'a jeśli nie wystartuje w określonym czasie

🔹 **Charakterystyka startupProbe:**
- Sprawdza, czy proces aplikacji **uruchomił się poprawnie**
- Przydatne dla **wolno startujących aplikacji** (np. duże JVM, migracje DB)
- Dopóki `startupProbe` nie zakończy się sukcesem, **inne probe'y** (`liveness` i `readiness`) są wstrzymane
- Jeśli aplikacja nie wystartuje w czasie określonym przez `failureThreshold * periodSeconds`, Pod zostaje **zabity i uruchomiony ponownie**

👉 **Typowy use case:** Aplikacja potrzebuje np. 2–3 min na rozruch, więc dajesz jej zapas (np. 5 minut)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: slow-startup-app
spec:
  containers:
  - name: java-app
    image: java-app:latest
    ports:
    - containerPort: 8080
    
    startupProbe:
      httpGet:
        path: /startup
        port: 8080
        
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 5
      # Daj aplikacji 5 minut na start (30 * 10s = 300s)
      failureThreshold: 30            # Więcej prób dla startup
      successThreshold: 1
      
    livenessProbe:
      # Uruchomi się dopiero po sukcesie startupProbe
      httpGet:
        path: /health
        port: 8080
      periodSeconds: 30
      
    readinessProbe:
      httpGet:
        path: /ready  
        port: 8080
      periodSeconds: 10
```

### 🛠️ Metody probe'ów

#### 1. HTTP GET Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
    scheme: HTTP                      # HTTP lub HTTPS
    httpHeaders:
    - name: Accept
      value: application/json
    - name: User-Agent
      value: kube-probe/1.0
```

#### 2. TCP Socket Probe

```yaml
livenessProbe:
  tcpSocket:
    port: 8080                        # Sprawdza czy port jest otwarty
  initialDelaySeconds: 15
  periodSeconds: 20
```

#### 3. Exec Probe

```yaml
livenessProbe:
  exec:
    command:                          # Komenda w kontenerze
    - cat
    - /tmp/healthy                    # Jeśli plik istnieje = healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 📊 Deployment z wszystkimi probe'ami

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-with-probes
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: webapp:latest
        ports:
        - containerPort: 8080
          name: http
          
        # Probe uruchomienia - dla wolno startujących aplikacji
        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 60          # 5 minut na start (60 * 5s)
          successThreshold: 1
          
        # Probe żywotności - restart jeśli nie żyje  
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 0        # startupProbe blokuje inne probe'y
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
          
        # Probe gotowości - traffic tylko do gotowych Pod'ów
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
          
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

### 🏥 Endpoint'y health check w aplikacji

#### Przykład /health endpoint

```json
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": "ok",
    "redis": "ok", 
    "external_api": "ok"
  }
}
```

#### Przykład /ready endpoint

```json
GET /ready
{
  "status": "ready",
  "checks": {
    "database_connection": "ok",
    "cache_warmed": "ok",
    "dependencies_loaded": "ok"
  }
}
```

---

## Debugging aplikacji w klastrze



### 📋 kubectl logs - analiza logów

#### Podstawowe użycie

```bash
# Logi z Pod'a
kubectl logs pod-name

# Logi z konkretnego kontenera w Pod'zie
kubectl logs pod-name -c container-name

# Logi z wszystkich kontenerów w Pod'zie  
kubectl logs pod-name --all-containers=true

# Follow logs (jak tail -f)
kubectl logs -f pod-name

# Ostatnie N linii
kubectl logs --tail=100 pod-name

# Logi z określonego czasu
kubectl logs --since=1h pod-name
kubectl logs --since=2024-01-15T10:00:00Z pod-name
```

#### Zaawansowane opcje logów

```bash
# Logi z poprzedniej instancji Pod'a (po restart)
kubectl logs pod-name --previous

# Logi z wszystkich Pod'ów w Deployment
kubectl logs -l app=webapp

# Logi z timestampami
kubectl logs --timestamps pod-name

# Streaming logs z wielu Pod'ów
kubectl logs -f -l app=webapp --max-log-requests=10
```

### 💻 kubectl exec - dostęp do kontenera

#### Podstawowe komendy

```bash
# Interaktywny shell w Pod'zie
kubectl exec -it pod-name -- /bin/bash

# Komenda w konkretnym kontenerze
kubectl exec -it pod-name -c container-name -- /bin/bash

```
### 🔍 kubectl describe - szczegółowe informacje

```bash
# Szczegółowe info o Pod'zie
kubectl describe pod pod-name

# Events związane z Pod'em
kubectl describe pod pod-name | grep -A 20 Events:

# Opisz wszystkie Pod'y z labelami
kubectl describe pods -l app=webapp

# Opisz Service
kubectl describe service webapp-service

# Opisz Deployment
kubectl describe deployment webapp-deployment
```


### 🛠️ Debugging Pod'ów

#### 1. Pod w stanie Pending

```bash
# Sprawdź dlaczego Pod nie może się uruchomić
kubectl describe pod pending-pod

# Typowe przyczyny:
# - Brak zasobów (CPU/RAM) na node'ach  
# - Niekompatybilne node selectors
# - Brak PersistentVolume dla PVC
# - Problemy z image pull
```

#### 2. Pod w stanie CrashLoopBackOff

```bash
# Sprawdź logi z poprzedniego uruchomienia
kubectl logs pod-name --previous

# Sprawdź konfigurację probe'ów
kubectl describe pod pod-name | grep -A 10 Probes

# Sprawdź czy obraz działa lokalnie
docker run webapp:latest

# Sprawdź events
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### 3. Pod w stanie ImagePullBackOff

```bash
# Sprawdź czy obraz istnieje
docker pull webapp:latest

# Sprawdź Secrets dla registry
kubectl get secrets
kubectl describe secret regcred

# Sprawdź czy ServiceAccount ma dostęp do Secret
kubectl describe serviceaccount default
```


### 🔧 Port forwarding do debugowania

```bash
# Forward portu z Pod'a na localhost
kubectl port-forward pod/webapp-pod 8080:80

# Forward portu z Service
kubectl port-forward service/webapp-service 8080:80

# Forward z Deployment
kubectl port-forward deployment/webapp 8080:80

# Teraz można testować lokalnie:
curl http://localhost:8080/health
```

### 📈 Monitoring zasobów

```bash
# Użycie zasobów przez Pod'y
kubectl top pods

# Użycie zasobów przez node'y  
kubectl top nodes

# Pod'y sortowane według użycia CPU
kubectl top pods --sort-by=cpu

# Pod'y sortowane według użycia RAM
kubectl top pods --sort-by=memory
```

---

## Podsumowanie

### 🎯 Kluczowe pojęcia z Modułu 3

- **ConfigMap** - externalizacja konfiguracji aplikacji
- **Secret** - bezpieczne przechowywanie danych wrażliwych (base64)
- **Montowanie konfiguracji** - jako zmienne środowiskowe lub pliki
- **livenessProbe** - czy aplikacja żyje (restart jeśli nie)
- **readinessProbe** - czy aplikacja gotowa na ruch (usunięcie z Service)
- **startupProbe** - czy aplikacja się uruchomiła (dla wolnych aplikacji)
- **kubectl logs/exec/describe** - podstawowe narzędzia debugowania

### 💡 Najważniejsze zasady

1. **Separacja konfiguracji** od kodu aplikacji
2. **Różne ConfigMap/Secret** dla różnych środowisk
3. **Nigdy nie hardkoduj** danych wrażliwych
4. **Używaj probe'ów** do monitorowania stanu aplikacji
5. **Loguj wszystko** co potrzebne do debugowania
6. **Testuj konfigurację** przed wdrożeniem na produkcję (Opcjonalne xd)

---

## Zadanie 

W repo znajdziecie plik debug.yaml który zawiera błędy. Zadanie polega na przesłaniu poprawionej wesji na swojego brancha (ten sam gdzie wysłaliście poprzednie).

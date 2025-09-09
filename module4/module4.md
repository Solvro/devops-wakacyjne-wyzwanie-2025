# Moduł 4: Helm – Menedżer pakietów dla Kubernetes

---

## Spis treści

1. [Wprowadzenie do Helma – czym jest i dlaczego warto go używać](#wprowadzenie-do-helma--czym-jest-i-dlaczego-warto-go-używać)
2. [Instalacja Helma i repozytoriów chartów](#instalacja-helma-i-repozytoriów-chartów)
3. [Podstawy pracy z Helm Charts](#podstawy-pracy-z-helm-charts)
4. [Tworzenie i modyfikacja prostego Helm Charta](#tworzenie-i-modyfikacja-prostego-helm-charta)
5. [Wdrażanie aplikacji z wykorzystaniem Helm](#wdrażanie-aplikacji-z-wykorzystaniem-helm)
6. [Zarządzanie releases i aktualizacje](#zarządzanie-releases-i-aktualizacje)
7. [Podsumowanie](#podsumowanie)
8. [Zadanie](#zadanie)

---

## Wprowadzenie do Helma – czym jest i dlaczego warto go używać

### 🎯 Definicja

> **Helm** to **menedżer pakietów** dla Kubernetes, często nazywany "APT/YUM dla Kubernetes". Pozwala na łatwe wdrażanie, aktualizowanie i zarządzanie aplikacjami w klastrze.

Helm to menedżer pakietów dla Kubernetes, który upraszcza wdrażanie i zarządzanie aplikacjami w klastrze. Zamiast utrzymywać wiele plików YAML, korzysta się z tzw. chartów – szablonów pozwalających instalować, aktualizować i usuwać aplikacje jednym poleceniem. Dzięki temu łatwo dostosować konfigurację do różnych środowisk, korzystać z gotowych repozytoriów aplikacji oraz szybko przywracać wcześniejsze wersje wdrożeń.

### 🤔 Problem, który rozwiązuje Helm

**Bez Helma:**
- 📝 **Dziesiątki plików YAML** do zarządzania
- 🔄 **Duplikacja kodu** między środowiskami 
- 😰 **Trudne aktualizacje** i rollbacki
- 🏗️ **Brak szablonowania** - hardkodowane wartości
- 📦 **Brak wersjonowania** wdrożeń
- 🔧 **Ręczne zarządzanie** zależnościami

**Z Helmem:**
- ✅ **Jeden Chart** = cała aplikacja
- ✅ **Szablonowanie** z parametrami
- ✅ **Łatwe aktualizacje** i rollbacki  
- ✅ **Różne wartości** dla różnych środowisk
- ✅ **Wersjonowanie releases**
- ✅ **Automatyczne zarządzanie** zależnościami

### 🧩 Kluczowe pojęcia Helm

| **Pojęcie** | **Opis** | **Przykład** |
|-------------|----------|--------------|
| **Chart** | Pakiet z szablonami YAML i konfiguracją | `nginx`, `wordpress`, `mysql` |
| **Release** | Instancja Chart'a wdrożona w klastrze | `my-nginx-prod`, `blog-staging` |
| **Values** | Parametry konfiguracyjne dla Chart'a | `replicas: 3`, `image.tag: v2.0` |
| **Template** | Szablony YAML z placeholderami | `{{ .Values.replicas }}` |
| **Repository** | Rejestr Chart'ów | Artifact Hub, własne repo |

---

Helm używa **Go template language** (szablonów języka Go) do generowania manifestów Kubernetes.

Oznacza to, że pliki w katalogu `templates/` nie są zwykłymi YAML-ami, tylko mogą zawierać instrukcje szablonowe, np.:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  myValue: {{ .Values.myValue }}
```

### 👉 Kilka ważnych elementów:

* `{{ ... }}` – oznacza wyrażenie szablonowe Go
* `.Values` – odnosi się do danych z pliku `values.yaml` (lub nadpisanych podczas instalacji)
* `.Release` – zawiera informacje o instalacji chartu (np. nazwa, wersja)
* **Funkcje szablonowe** – np. `default`, `quote`, `upper`, które pozwalają obrabiać wartości
* `_helpers.tpl` – umożliwia definiowanie własnych funkcji/pomocniczych szablonów


W skrócie: Helm **generuje zwykłe pliki YAML dla Kubernetes**, ale używa języka szablonów Go, żeby były one elastyczne i parametryzowane.

---

### 💡 Korzyści z używania Helm

#### 1. **Szablonowanie i parametryzacja**
```yaml
# Bez Helm - hardkodowane wartości
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: webapp
        image: webapp:1.0.0
        
# Z Helm - parametryzowane
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.app.name }}
spec:
  replicas: {{ .Values.replicas }}
  template:
    spec:
      containers:
      - name: {{ .Values.app.name }}
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
```

#### 2. **Zarządzanie wersjami i rollback**
```bash
# Historia releases
helm history my-app
# REVISION  UPDATED             STATUS      CHART        APP VERSION  DESCRIPTION
# 1         Mon Jan 15 10:00:00  superseded  webapp-1.0.0 1.0.0       Install complete
# 2         Mon Jan 15 11:00:00  deployed    webapp-1.1.0 1.1.0       Upgrade complete

# Rollback do poprzedniej wersji
helm rollback my-app 1
```

#### 3. **Łatwe zarządzanie środowiskami**
```bash
# Development
helm install webapp-dev ./webapp-chart -f values-dev.yaml

# Production  
helm install webapp-prod ./webapp-chart -f values-prod.yaml
```

---

## Instalacja Helma i repozytoriów chartów


#### Linux
```bash
# Ubuntu/Debian
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm


#### Weryfikacja instalacji
```bash
# Sprawdź wersję
helm version
# version.BuildInfo{Version:"v3.14.0", GitCommit:"3fc9f4b2455d1249d9965afc5a0be3413b3e9d8b", GitTreeState:"clean", GoVersion:"go1.21.7"}

# Sprawdź dostępne komendy
helm --help
```

### 📚 Repozytoria Chart'ów

#### Dodawanie popularnych repozytoriów

```bash
# Oficjalne repozytoria
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add elastic https://helm.elastic.co

# Aktualizacja informacji o repozytoriach
helm repo update

# Lista dodanych repozytoriów
helm repo list
# NAME                 	URL
# stable               	https://charts.helm.sh/stable
# bitnami              	https://charts.bitnami.com/bitnami
# ingress-nginx        	https://kubernetes.github.io/ingress-nginx
```

#### Wyszukiwanie Chart'ów

```bash
# Wyszukaj Chart'y z nginx
helm search repo nginx

# Wyszukaj Chart'y w Artifact Hub
helm search hub wordpress

# Szczegółowe informacje o Chart'cie
helm show chart bitnami/nginx
helm show values bitnami/nginx
helm show readme bitnami/nginx
```

---

## Podstawy pracy z Helm Charts

### 📦 Struktura Helm Chart

```
webapp-chart/
├── Chart.yaml          # Metadane Chart'a
├── values.yaml         # Domyślne wartości
├── charts/             # Zależności (subcharts)
├── templates/          # Szablony Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl    # Template helpers
│   └── NOTES.txt       # Informacje po instalacji
└── .helmignore         # Pliki do ignorowania
```

### 📋 Chart.yaml - metadane
To główny plik definicji chartu, zawierający podstawowe informacje, takie jak nazwa, wersja, opis czy autor.
Określa także wersję Helm, z którą chart jest kompatybilny, oraz ewentualne zależności od innych chartów.
Jest kluczowy przy publikowaniu chartów w repozytoriach, bo pozwala identyfikować aplikację i jej wersję.

```yaml
apiVersion: v2                    # Wersja API Helm (v2 dla Helm 3)
name: webapp-chart                # Nazwa Chart'a
description: A Helm chart for webapp application
type: application                 # application lub library
version: 0.1.0                   # Wersja Chart'a (SemVer)
appVersion: "1.0.0"              # Wersja aplikacji

# Opcjonalne metadane
maintainers:
  - name: Jan Kowalski
    email: jan.kowalski@example.com
    url: https://github.com/jkowalski

home: https://webapp.example.com
sources:
  - https://github.com/company/webapp
  - https://github.com/company/webapp-chart

keywords:
  - webapp
  - web
  - http

# Zależności (zamiast requirements.yaml w Helm 2)
dependencies:
  - name: postgresql
    version: "12.1.2"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis  
    version: "17.3.7"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

### ⚙️ values.yaml - konfiguracja domyślna
Zawiera domyślne wartości konfiguracyjne, które mogą być wczytane przez szablony w katalogu. W dobrze przygotowanym charcie cała konfiguracja odbywa się przez zmiane wartości w pliku values.

```yaml
# Konfiguracja aplikacji
app:
  name: webapp
  version: 1.0.0

# Konfiguracja obrazu
image:
  repository: webapp
  tag: "latest"
  pullPolicy: IfNotPresent

# Replikacja
replicaCount: 1

# Service
service:
  type: ClusterIP
  port: 80
  targetPort: 8080

# Ingress
ingress:
  enabled: false
  className: "nginx"
  annotations: {}
  hosts:
    - host: webapp.local
      paths:
        - path: /
          pathType: Prefix
  tls: []

# Resources
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# Autoscaling
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# Health checks
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5

# ConfigMap
config:
  DATABASE_URL: "postgresql://postgres:5432/webapp"
  LOG_LEVEL: "INFO"
  CACHE_TTL: "3600"

# Secret (będą zakodowane w base64)
secrets:
  DATABASE_PASSWORD: "secret123"
  API_KEY: "sk-1234567890"

# Zależności
postgresql:
  enabled: true
  auth:
    postgresPassword: "postgres123"
    database: "webapp"

redis:
  enabled: false
```
###  charts

Jest to katalog przechowujący dodatkowe charty, które stanowią zależności dla głównego chartu.
Dzięki temu można łatwo wdrożyć aplikację wraz z wymaganymi komponentami (np. aplikacja + baza danych).
W praktyce często korzysta się z repozytoriów zewnętrznych, ale katalog charts/ pozwala też przechowywać zależności lokalnie.

### templates
To katalog zawierający właściwe szablony manifestów Kubernetes, np. Deployment, Service, ConfigMap, Ingress.
Szablony są renderowane z użyciem danych z values.yaml i funkcji z helpers.tpl, co daje dużą elastyczność.
To właśnie tutaj definiuje się logikę wdrożenia aplikacji w klastrze Kubernetes.

### helpers.tpl
To plik zawierający pomocnicze funkcje i fragmenty szablonów, które można wielokrotnie wykorzystać w innych plikach w katalogu templates/.
Najczęściej definiuje się w nim np. standardowe nazwy zasobów czy etykiety, aby zachować spójność w całym wdrożeniu.
Dzięki temu unika się powtarzalnego kodu i ułatwia utrzymanie manifestów.

---

## Tworzenie i modyfikacja prostego Helm Charta

### 🛠️ Tworzenie nowego Chart'a

```bash
# Tworzenie pustego Chart'a
helm create webapp-chart

# Struktura zostanie automatycznie wygenerowana
tree webapp-chart/
```

### 📝 Template deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "webapp-chart.fullname" . }}
  labels:
    {{- include "webapp-chart.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "webapp-chart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "webapp-chart.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          
          # Health checks
          {{- if .Values.livenessProbe }}
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          {{- end }}
          
          {{- if .Values.readinessProbe }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          {{- end }}
          
          # Resources
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          
          # Environment variables z ConfigMap
          envFrom:
          - configMapRef:
              name: {{ include "webapp-chart.fullname" . }}-config
          - secretRef:
              name: {{ include "webapp-chart.fullname" . }}-secret
              
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

### 🔧 Template service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "webapp-chart.fullname" . }}
  labels:
    {{- include "webapp-chart.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
      {{- if and (eq .Values.service.type "NodePort") .Values.service.nodePort }}
      nodePort: {{ .Values.service.nodePort }}
      {{- end }}
  selector:
    {{- include "webapp-chart.selectorLabels" . | nindent 4 }}
```

### 🗺️ Template configmap.yaml

```yaml
{{- if .Values.config }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "webapp-chart.fullname" . }}-config
  labels:
    {{- include "webapp-chart.labels" . | nindent 4 }}
data:
  {{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
  {{- end }}
{{- end }}
```

### 🔐 Template secret.yaml

```yaml
{{- if .Values.secrets }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "webapp-chart.fullname" . }}-secret
  labels:
    {{- include "webapp-chart.labels" . | nindent 4 }}
type: Opaque
data:
  {{- range $key, $value := .Values.secrets }}
  {{ $key }}: {{ $value | b64enc }}
  {{- end }}
{{- end }}
```

### 🚪 Template ingress.yaml

```yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "webapp-chart.fullname" . }}
  labels:
    {{- include "webapp-chart.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "webapp-chart.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
```

### 🤝 Template _helpers.tpl

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "webapp-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "webapp-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "webapp-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "webapp-chart.labels" -}}
helm.sh/chart: {{ include "webapp-chart.chart" . }}
{{ include "webapp-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "webapp-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "webapp-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

---

## Wdrażanie aplikacji z wykorzystaniem Helm

### 🚀 Instalacja Chart'a

#### Instalacja z lokalnego katalogu

```bash
# Podstawowa instalacja
helm install my-webapp ./webapp-chart

# Z niestandardowymi wartościami
helm install my-webapp ./webapp-chart \
  --set replicaCount=3 \
  --set image.tag=v2.0.0

# Z plikiem values
helm install my-webapp ./webapp-chart -f custom-values.yaml

# Instalacja w konkretnej namespace
helm install my-webapp ./webapp-chart \
  --namespace webapp \
  --create-namespace
```

#### Instalacja z repozytorium

```bash
# Instalacja nginx z repozytorium bitnami
helm install my-nginx bitnami/nginx

# Z niestandardowymi wartościami
helm install my-nginx bitnami/nginx \
  --set service.type=LoadBalancer \
  --set replicaCount=2
```

### 📊 Monitorowanie instalacji

```bash
# Status release'a
helm status my-webapp

# Lista wszystkich releases
helm list

# Lista w konkretnej namespace
helm list -n webapp

# Historia zmian
helm history my-webapp
```



## Zarządzanie releases i aktualizacje

### 🔄 Aktualizacja aplikacji

```bash
# Aktualizacja z nowymi wartościami
helm upgrade my-webapp ./webapp-chart \
  --set image.tag=v2.0.0

# Aktualizacja z nowym plikiem values
helm upgrade my-webapp ./webapp-chart \
  -f values-prod-v2.yaml

# Wymuszenie odtworzenia Pod'ów
helm upgrade my-webapp ./webapp-chart \
  --force

# Atomic upgrade (rollback jeśli niepowodzenie)
helm upgrade my-webapp ./webapp-chart \
  --atomic \
  --timeout=5m
```

### ↩️ Rollback

```bash
# Rollback do poprzedniej wersji
helm rollback my-webapp

# Rollback do konkretnej rewizji
helm rollback my-webapp 2

# Historia zmian
helm history my-webapp
# REVISION  UPDATED             STATUS       CHART           APP VERSION  DESCRIPTION
# 1         Mon Jan 15 10:00:00  superseded   webapp-0.1.0    1.0.0       Install complete
# 2         Mon Jan 15 11:00:00  superseded   webapp-0.1.1    1.1.0       Upgrade complete
# 3         Mon Jan 15 12:00:00  deployed     webapp-0.1.0    1.0.0       Rollback to 1
```

### 🗑️ Usuwanie

```bash
# Usunięcie release'a (zachowuje historię)
helm uninstall my-webapp

# Usunięcie wraz z historią
helm uninstall my-webapp --keep-history=false

# Usunięcie z konkretnej namespace
helm uninstall my-webapp -n webapp
```

### 🧪 Testowanie przed wdrożeniem

```bash
# Dry run - sprawdź co zostanie utworzone
helm install my-webapp ./webapp-chart --dry-run

# Template - wygeneruj YAML bez instalacji
helm template my-webapp ./webapp-chart

# Validation - sprawdź poprawność Chart'a
helm lint ./webapp-chart

# Test hooks
helm test my-webapp
```



### 🔍 Debugging

```bash
# Sprawdzenie wartości używanych przez release
helm get values my-webapp

# Sprawdzenie manifestów
helm get manifest my-webapp

# Sprawdzenie wszystkich informacji o release
helm get all my-webapp

# Debug template rendering
helm template my-webapp ./webapp-chart --debug
```

---

## Podsumowanie

### 🎯 Kluczowe pojęcia z Modułu 4

- **Helm** - menedżer pakietów dla Kubernetes
- **Chart** - pakiet zawierający szablony i konfigurację
- **Release** - instancja Chart'a wdrożona w klastrze  
- **Values** - parametry konfiguracyjne
- **Template** - szablony YAML z placeholderami
- **Repository** - rejestr Chart'ów

### 💡 Najważniejsze zasady

1. **Używaj templates** zamiast hardkodowanych wartości
2. **Różne pliki values** dla różnych środowisk
3. **Testuj Chart'y** przed wdrożeniem (`helm lint`, `--dry-run`)
4. **Wersjonuj Chart'y** zgodnie z SemVer
5. **Dokumentuj** parametry w values.yaml i README
6. **Używaj dependencies** dla zewnętrznych serwisów

---
### Materiały dodatkowe 
- teoria helm - https://www.youtube.com/watch?v=w51lDVuRWuk
- praktyczny mini kurs - https://www.youtube.com/playlist?list=PLSwo-wAGP1b8svO5fbAr7ko2Buz6GuH1g
- ciekawy post (mniej kodu więcej opowiadania) - https://programistajava.pl/2025/02/22/co-to-jest-helm-i-jak-go-uzywac-w-kubernetes/
## Zadanie

Zadanie polega na stworzeniu Helm Chart'a dla aplikacji (dowolna, może być nginx)i wdrożeniu jej w dwóch wariantach: development i production.

### 📋 Wymagania

1. **Stwórz Helm Chart** o nazwie `webapp` zawierający:
   - Deployment z ConfigMap i Secret
   - Service 
   - Health checks

2. **Utwórz dwa pliki values**:
   - `values-dev.yaml` - 1 replika, NodePort
   - `values-prod.yaml` - 3 repliki, ClusterIP, włączony autoscaling

3. **Wdróż aplikację** w dwóch wersjach:
   - `webapp-dev` w namespace `development`
   - `webapp-prod` w namespace `production`

5. **Wykonaj upgrade** - zmień tag obrazu i zaktualizuj deployment

### 📁 Co do oddania?
Na tego samego brancha co poprzednie zadanie wrzucacie podobny folder z plikami
```
webapp-chart/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── configmap.yaml
    ├── secret.yaml
    └── _helpers.tpl
```


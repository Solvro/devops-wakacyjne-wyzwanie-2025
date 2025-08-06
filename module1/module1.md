# Moduł 1



---

## Spis treści

1. [Co to są kontenery?](#co-to-są-kontenery)
2. [Co to jest Kubernetes i po co się go używa?](#co-to-jest-kubernetes-i-po-co-się-go-używa)
3. [Architektura Kubernetes](#architektura-kubernetes)
4. [Przykład z życia](#przykład-z-życia)
5. [Podsumowanie](#podsumowanie)
6. [Przygotowanie środowiska](#przygotowanie-środowiska)
7. [Minikube i k9s](#minikube-i-k9s)
8. [Zadanie](#zadanie)

---

## Co to są kontenery?

### 📦 Definicja

> **Kontener** to lekka, przenośna i odizolowana jednostka uruchomieniowa dla aplikacji i wszystkich jej zależności (bibliotek, plików konfiguracyjnych, itd.).

Kontenery pozwalają na:
- ✅ **Spakowanie aplikacji** z całym jej środowiskiem
- ✅ **Uruchomienie jej w dowolnym systemie**, który obsługuje kontenery (np. Docker, containerd)
- ✅ **Unikanie problemu „u mnie działa"**
- ✅ **Osiągnięcie spójności** między środowiskami deweloperskim, testowym i produkcyjnym

### 🆚 Różnice między kontenerami a maszynami wirtualnymi

<img src="https://main.pl/wp-content/uploads/2022/05/Schemat_kontenery-i-maszyny-wirtualne.webp" alt="Schemat kontenery i maszyny wirtualne" width="50%">


| Cechy | Maszyna wirtualna (VM) | Kontener |
|-------|------------------------|----------|
| **System operacyjny** | Każda VM ma własny OS | Współdzielą jądro hosta |
| **Rozmiar** | Setki MB - kilka GB | Kilkadziesiąt MB |
| **Uruchamianie** | Wolniejsze (sekundy-minuty) | Bardzo szybkie (milisekundy) |
| **Izolacja** | Pełna (hipernadzorca) | Izolacja przez namespace'y i cgroups |
| **Zużycie zasobów** | Wysokie | Niskie |
| **Przenośność** | Ograniczona | Wysoka |

### 🛠️ Ekosystem kontenerów

**Kontener = Kod + Środowisko uruchomieniowe**

Typowe narzędzia w ekosystemie kontenerów:
- **Docker** – najpopularniejsze narzędzie do tworzenia i uruchamiania kontenerów
- **containerd** – lekki runtime używany np. przez Kubernetes
- **Podman** – alternatywa dla Dockera bez daemona
- **runc** – niskopoziomowy runtime zgodny ze standardem OCI
---
Jeśli chcesz dowiedzieć się więcej o działaniu kontenerów polecam zapoznać się z:
- https://blogs.bmc.com/containers-vs-virtual-machines?print-posts=print 
- https://www.youtube.com/watch?v=X2hpxp3Kq6A
---


## Co to jest Kubernetes i po co się go używa?

### 🎯 Definicja

> **Kubernetes** (w skrócie: **K8s**) to **system orkiestracji kontenerów** – czyli narzędzie do **automatycznego zarządzania aplikacjami uruchomionymi w kontenerach**.

Został stworzony przez Google na bazie ich wewnętrznego systemu Borg, obecnie rozwijany przez **Cloud Native Computing Foundation (CNCF)**.

### ⚡ Możliwości Kubernetes

Kubernetes potrafi:
- 🔄 **Uruchamiać kontenery** w klastrze serwerów (Node'ów)
- 🔧 **Monitorować i restartować** uszkodzone aplikacje (self-healing)
- 📈 **Automatycznie skalować aplikacje** (w górę/w dół) na podstawie obciążenia
- ⚖️ **Równoważyć ruch** między instancjami aplikacji (load balancing)
- 🚀 **Wdrażać nowe wersje** aplikacji bez przestoju (rolling updates)
- 🔐 **Zarządzać konfiguracją** i tajnymi danymi (Secrets, ConfigMaps)
- 💾 **Zapewniać persistent storage** dla aplikacji stanowych
- 🌐 **Implementować service mesh** i zaawansowane strategie sieciowe

### 🤔 Dlaczego Kubernetes?

W tradycyjnym podejściu do zarządzania aplikacjami:
- 📝 Masz skrypt do uruchamiania aplikacji? Ok.
- ⏹️ Potem potrzebujesz drugi, żeby ją zatrzymać.
- 🔟 A jak chcesz 10 kopii? 10 skryptów?
- ❌ A jak któraś padnie? Musisz ją ręcznie wznowić.
- 🔄 A jak zaktualizować aplikację bez przestoju?
- ⚙️ Jak zarządzać konfiguracją w różnych środowiskach?

Wszystko to prowadzi do chaosu operacyjnego i błędów ludzkich.

> 💡 **Rozwiązanie:** **Kubernetes automatyzuje te procesy.** Możesz zadeklarować **jak ma wyglądać stan aplikacji**, a K8s sam to osiągnie i utrzyma.

### 📋 Kubernetes jako system deklaratywny
<img src="https://kodekloud.com/kk-media/image/upload/v1752880673/notes-assets/images/Kubernetes-and-Cloud-Native-Associate-KCNA-Imperative-vs-Declarative/frame_90.jpg" width="50%">

**Podejście imperatywne** to jak dawanie szczegółowych instrukcji:
- "Idź prosto"
- "Skręć w prawo" 
- "Skręć w lewo"
- "Skręć w prawo"

**Podejście deklaratywne** to po prostu powiedzenie:
- "Idź do domu Tomka"

Zamiast pisać imperatywnie:
*„uruchom aplikację, nazwij ją X, daj jej 2 procesory..."*

Piszemy deklaratywnie w YAML:

```yaml
# Przykład deklaracji aplikacji w Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: moja-aplikacja
spec:
  replicas: 3
  selector:
    matchLabels:
      app: moja-aplikacja
  template:
    metadata:
      labels:
        app: moja-aplikacja
    spec:
      containers:
      - name: app-container
        image: nginx:latest
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

A Kubernetes automatycznie:
- ➡️ uruchomi 3 kopie aplikacji
- ➡️ rozłoży je po różnych węzłach klastra
- ➡️ zadba o ich zdrowie (health checks)
- ➡️ zrobi rolling update przy zmianie wersji
- ➡️ przywróci kopie w przypadku awarii

---

## Architektura Kubernetes

<img src="https://miro.medium.com/v2/resize:fit:1400/1*eVqphQ2aNKxqHPMPxjRzAA.png" width="70%">

### 🧠 Komponenty Control Plane

**Control Plane** to „mózg" klastra Kubernetes, składający się z:

- **kube-apiserver** – punkt wejścia do API Kubernetes
- **etcd** – rozproszona baza danych przechowująca stan klastra
- **kube-scheduler** – przydziela Pody do węzłów
- **kube-controller-manager** – uruchamia kontrolery zarządzające stanem klastra
- **cloud-controller-manager** – integracja z dostawcami chmury

### 💪 Komponenty Worker Node

Każdy **Worker Node** zawiera:

- **kubelet** – agent komunikujący się z Control Plane
- **kube-proxy** – zarządza ruchem sieciowym i zapewnia dostęp użytkownikom końcowym do naszych aplikacji
- **Container Runtime** – uruchamia kontenery (Docker, containerd, CRI-O)
---
    Bardziej szczegółowy opis elementnów klastra - https://www.youtube.com/watch?v=gjk82Y2vyro
---

## Przykład z życia

### 🛒 Scenariusz: Aplikacja e-commerce

Masz aplikację webową e-commerce składającą się z:
- Frontend (React)
- API Backend (Node.js)
- Baza danych (PostgreSQL)

### ✨ Co może zrobić Kubernetes:

1. **Uruchomić każdy komponent** w oddzielnych Podach
2. **Automatycznie przydzielić zasoby** i rozłożyć po węzłach
3. **Wykryć awarie** i odtworzyć uszkodzone Pody
4. **Przekierować ruch** przez Services z load balancingiem
5. **Zrobić rolling update** backendu bez przestoju
6. **Skalować frontend** przy zwiększonym ruchu
7. **Zarządzać hasłami** do bazy przez Secrets
8. **Zapewnić persistent storage** dla bazy danych

---


## Podsumowanie

- 📦 **Kontenery** to lekkie i przenośne środowiska dla aplikacji, rewolucjonizujące sposób pakowania i wdrażania oprogramowania

- ⚙️ **Kubernetes** to potężne narzędzie do zarządzania kontenerami na dużą skalę, automatyzujące procesy deployment'u, skalowania i utrzymania aplikacji

- 🚀 **K8s ułatwia automatyzację**, zwiększa niezawodność i umożliwia efektywne zarządzanie zasobami w środowiskach produkcyjnych


---
## Przygotowanie środowiska

### 🛠️ Co będzie nam potrzebne w tym kursie:

- **Linux OS** (Ubuntu 24.04 LTS - zalecane)
- **Docker** - do uruchamiania kontenerów
- **minikube** - lokalne środowisko Kubernetes
- **kubectl** - narzędzie wiersza poleceń do zarządzania Kubernetes
- **k9s** - graficzny interfejs terminalowy (zalecane)

> 💡 **Zachęcam do próby samodzielnego przygotowania środowiska!** Można dużo się nauczyć w trakcie konfiguracji. Jeśli jednak napotkasz problemy, poniżej znajdziesz szczegółowe instrukcje krok po kroku.

---

### 1️⃣ Instalacja systemu Ubuntu 24.04

Zainstaluj system Ubuntu 24 na maszynie wirtualnej lub fizycznej. Możesz użyć **VirtualBox**, **VMware** lub innego narzędzia do wirtualizacji.

🎥 **Link do tutorialu video:** https://www.youtube.com/watch?v=Hva8lsV2nTk

**Minimalne wymagania systemowe:**
- RAM: 4GB (zalecane 8GB)
- Dysk: 20GB wolnego miejsca
- Procesor: 2 rdzenie (zalecane 4)

---

### 2️⃣ Instalacja Docker

**Docker** to platforma konteneryzacji, którą wykorzysta minikube do uruchamiania klastra Kubernetes.

```bash
# Instalacja Docker
sudo apt install -y docker.io

# Dodanie użytkownika do grupy docker (aby nie używać sudo)
sudo usermod -aG docker $USER

# Aktywacja grupy docker dla bieżącej sesji
newgrp docker

# Włączenie Docker jako usługa systemowa
sudo systemctl enable docker
sudo systemctl start docker
```

**🔍 Weryfikacja instalacji:**
```bash
# Sprawdź czy użytkownik jest w grupie docker
groups
```

> ⚠️ **Ważne:** Jeśli `docker` nie pojawia się na liście grup, wykonaj restart systemu (`sudo reboot`).

**Test Docker:**
```bash
# Uruchom testowy kontener
docker run hello-world
```

Jeśli widzisz wiadomość powitalną - Docker działa poprawnie! 🎉

---

### 3️⃣ Instalacja kubectl

**kubectl** to główne narzędzie do komunikacji z klastrem Kubernetes. Pozwala na zarządzanie wszystkimi zasobami klastra z linii poleceń.

```bash
# Pobierz najnowszą stabilną wersję kubectl
KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)
curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"

# Nadaj uprawnienia wykonywania
chmod +x kubectl

# Przenieś do katalogu systemowego
sudo mv kubectl /usr/local/bin/

# Sprawdź wersję (weryfikacja instalacji)
kubectl version --client
```

**Oczekiwany rezultat:**
```
Client Version: v1.28.x (lub nowsza)
```

---

### 4️⃣ Instalacja minikube

**minikube** to narzędzie, które uruchamia jednowęzłowy klaster Kubernetes lokalnie. Idealny do nauki i testowania.

```bash
# Pobierz najnowszą wersję minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Zainstaluj minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Sprawdź wersję
minikube version
```

**Oczekiwany rezultat:**
```
minikube version: v1.32.x (lub nowsza)
```

---

### 5️⃣ Instalacja k9s (zalecane)

**k9s** to fantastyczne narzędzie, które daje graficzny interfejs w terminalu do zarządzania klastrem Kubernetes. Znacznie ułatwia pracę! 🚀

```bash
# Aktualizacja systemu i instalacja wymaganych pakietów
sudo apt update
sudo apt install build-essential procps curl file git

# Instalacja Homebrew (menedżer pakietów)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Dodanie Homebrew do PATH
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# Instalacja k9s przez Homebrew
brew install k9s
```

**Weryfikacja:**
```bash
k9s version
```

---

### 6️⃣ Uruchomienie minikube

Teraz czas na uruchomienie naszego lokalnego klastra Kubernetes! 🎯

```bash
# Uruchom minikube z dockerem jako driver
minikube start --driver=docker

# Sprawdź status węzłów klastra
kubectl get nodes
```

**Oczekiwany rezultat:**
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   30s   v1.28.x
```

**🎉 Gratulacje!** Masz działający klaster Kubernetes!

---

##  Minikube i k9s

### 📦 Minikube - Twój lokalny klaster Kubernetes

**Minikube** to nie tylko narzędzie instalacyjne - to potężne środowisko deweloperskie, które symuluje pełnoprawny klaster Kubernetes na Twojej maszynie.

#### 🔍 Podstawowe polecenia minikube

```bash
# Status klastra
minikube status

# Zatrzymanie klastra
minikube stop

# Uruchomienie klastra
minikube start

# Usunięcie klastra (wszystkich danych!)
minikube delete

# Dashboard Kubernetes w przeglądarce
minikube dashboard

# IP klastra
minikube ip

# SSH do węzła minikube
minikube ssh
```

#### 💡 Dlaczego minikube jest świetny do nauki?

- **Bezpieczeństwo** - eksperymenty w izolowanym środowisku
- **Resetowanie** - `minikube delete && minikube start` i masz czysty klaster
- **Szybkość** - uruchomienie w sekundy, nie minuty
- **Kompatybilność** - zachowuje się jak prawdziwy klaster K8s

---

### 🚀 k9s - Kubernetes w terminalu 

**k9s** to narzędzie, które zamienia nudny terminal w interaktywny, kolorowy interfejs do zarządzania Kubernetes. To jak "Task Manager" dla K8s!

#### 🎮 Podstawy k9s


```bash
# Uruchom k9s
k9s
```

#### 🔥 Kluczowe funkcje k9s

**1. Nawigacja:**
- `:pods` - zobacz wszystkie Pod'y
- `:services` - zobacz wszystkie Service'y  
- `:deployments` - zobacz wszystkie Deployment'y
- `:nodes` - zobacz węzły klastra
- `:namespaces` - przełączaj się między namespace'ami

**2. Skróty klawiszowe (najważniejsze):**

| Klawisz | Akcja |
|---------|--------|
| `ENTER` | Szczegóły zasobu |
| `d` | Usuń zasób |
| `e` | Edytuj zasób |
| `l` | Logi (dla Pod'ów) |
| `s` | Shell do kontenera |
| `y` | YAML zasobu |
| `?` | Pomoc |
| `q` | Wyjdź/Wstecz |
| `/` | Filtrowanie |

**3. Monitoring w czasie rzeczywistym:**
- **CPU/Memory usage** - widoczne od razu
- **Status zasobów** - kolorowe oznaczenia (zielony=OK, czerwony=błąd)
- **Auto-refresh** - widok aktualizuje się automatycznie

**4. Logi i debugging:**

W k9s przejdź do Pod'a i naciśnij `l` - zobaczysz logi w czasie rzeczywistym!

Naciśnij `s` - otrzymasz shell do kontenera (jak SSH, ale do Pod'a w K8s)

---
## Zadanie

Pierwsze zadanie polega na **zdeployowaniu serwera Nginx** z wykorzystaniem pliku YAML znajdującego się w tym folderze.  
Zawartością pliku zajmiemy się w późniejszych modułach – **na razie skupiamy się wyłącznie na użyciu `kubectl`**.

### Krok po kroku:

1. **Zdeployuj Nginx** za pomocą dostarczonego pliku YAML.
2. Po wdrożeniu, dostań się do kontenera i **zmień treść strony** na wybraną przez siebie.
3. **Zrób zrzut ekranu**, na którym widać:
   - Twoją stronę w przeglądarce,
   - Widok podów w narzędziu `k9s`.
4. **Pochwal się screenem w wątku na kanale Discord** 🎉

---

### Wstęp do kolejnego modułu:

Spróbuj **zresetować poda** (`kubectl delete pod <nazwa-poda>`) i sprawdź, **co stanie się ze stroną** po jego ponownym uruchomieniu.

# Pré-requisitos

- **Ter o Node.js instalado no computador**
- **Ter o NativeScript CLI instalado globalmente**

---

# Passo a Passo para Instalação e Execução

## **1. Instalar o NativeScript CLI globalmente**
```bash
npm install -g @nativescript/cli
```

---

## **2. Preparar o ambiente Android**

1. **Instalar o Java Development Kit (JDK)**  
2. **Instalar o Android Studio**  
3. **Configurar as variáveis de ambiente:**
   - `ANDROID_HOME`
   - `JAVA_HOME`  
4. **Instalar o Android SDK através do Android Studio**

---

## **3. Clonar o projeto**

1. **Criar uma pasta para o projeto**  
2. **Copiar todos os arquivos do projeto para esta pasta**

---

## **4. Instalar as dependências**
Na pasta do projeto, execute o comando:
```bash
npm install
```

---

## **5. Executar o projeto**

### **Para desenvolvimento e teste:**
```bash
ns run android
```

### **Para apenas visualizar:**
```bash
ns preview
```

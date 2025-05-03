# Prototipo TE
 Prototipo para el proyecto del Grupo 2 de LLM/Gen AI de la asignatura de Tecnologías Emergentes ICI5442-2.

 # Integrante

 1. Ademir Muñoz
 2. Joseph Donoso
 3. Sebastián Yáñez
 4. Jorge Villarreal

 # Como utilizar el prototipo

 Primero se debe clonar el repositorio.

```shell
 git clone "https://github.com/LotaSchwager/PrototipoTE.git"
 cd PrototipoTE
```

Luego instalar las dependencias, es **importante** el ```--force``` debidos a problemas entre algunas versiones.

```shell
npm install --force
```
Tambien es importante instalar [Ollama](https://ollama.com/) e instalar los tres modelos con fine-tunning utilizando Powershell o CMD.

```shell
ollama run hf.co/Ainxz/qwen2.5-pucv-gguf
ollama run hf.co/Ainxz/llama3.2-pucv-gguf
ollama run hf.co/Ainxz/phi3.5-pucv-gguf
```

Teniendo el prototipo con ```node_modules``` y los modelos instalados con ollama, recien se puede inicializar el prototipo.

Como ejecutar el prototipo en modo dev.

```shell
npm run dev
```

Como ejecutar el prototipo modo usuario

```shell
npm run build
npm run start
```

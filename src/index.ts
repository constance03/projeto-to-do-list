// configurações iniciais

//     criar o package.json
// npm init -y

//     editar os scripts do package.json
// "start": "node ./build/index.js",
// "build": "tsc",
// "dev": "ts-node-dev ./src/index.ts"

//     instalar typescript e tipagens do node e o ts-node-dev
// npm i -D typescript @types/node ts-node-dev

//     configurar o typescript
// npx tsc --init

//     editar arquivo tsconfig.json
// {
//     "compilerOptions": {
//         "target": "ES6",
//         "module": "commonjs",   
//         "sourceMap": true,       
//         "outDir": "./build",      
//         "rootDir": "./src",       
//         "removeComments": true,   
//         "noImplicitAny": true,      
//         "esModuleInterop": true,
//         "noEmitOnError": true,
//         "strict": true
//     }
// }

//     instalar express e cors & fazer a tipagem
// npm i express cors
// npm i -D @types/express @types/cors

//     instalar knex e sqlite3 & tipagens
// npm i knex sqlite3
// npm i -D @types/knex

//     criar pasta data base e arquivos db e sql
//     configurar arquivo knex no database
// import knex from "knex"
// export const db = knex({
//     client: "sqlite3",
//     connection: {
//         filename: "./src/database/to-do-list.db", //localização do seu arquivo .db
//     },
//     useNullAsDefault: true, // definirá NULL quando encontrar valores undefined
//     pool: {
//         min: 0, // número de conexões, esses valores são os recomendados para sqlite3
//         max: 1,
//                 afterCreate: (conn: any, cb: any) => {
//             conn.run("PRAGMA foreign_keys = ON", cb)
//         } // configurando para o knex forçar o check das constrainst FK
//                     // para entender melhor, depois assista o vídeo de refatoração de DELETE users by id
//     }
// })

//     criar e setar o arquivo index.ts dentro do src
import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserTaskDB, TUserDB, TTaskDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        const result = await db("users")
        res.status(200).send({ message: "Pong!", result })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// ## Users
// - GET all users
app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await db("users")
        res.status(200).send({usuarios: result})
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
  })  

// - POST user
app.post("/users", async (req: Request, res: Response) => {
    try {
        const {id, name, email, password} = req.body
        
        if (typeof id != "string") {
            res.status(400)
            throw new Error("'id' invalido, deve ser uma string")
        }

        if (typeof name != "string") {
            res.status(400)
            throw new Error("'name' invalido, deve ser uma string")
        }
  
        if (typeof email != "string") {
            res.status(400)
            throw new Error("'email' invalido, deve ser uma string")
        }
  
        if (typeof password != "string") {
          res.status(400)
          throw new Error("'password' invalido, deve ser uma string")
      }

  
        if (id.length < 4 || name.length < 2) {
            res.status(400)
            throw new Error("'id' deve ter pelo menos 4 caracteres ou 'name' deve ter no mínimo 2 caracteres")
        }
  
        const [userIdAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({id})
        
        if (userIdAlreadyExists) {
            res.status(400)
            throw new Error("'userId' já existe")
        }

        const newUser = { 
            id, 
            name,
            email, 
            password
        }
  
          await db("users").insert(newUser)

          const [insertedUser]: TUserDB[] = await db("users").where({id})
  
        res.status(201).send({
            message: `Cadastrado de usuário realizado com sucesso`, 
            user: insertedUser
        })
  
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// - DELETE user by id
app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "f") {
            res.status(400)
            throw new Error("'idToDelete' deve iniciar com a letra 'f'")
        }

        const [user]: TUserDB[] | undefined[] = await db("users").where({id: idToDelete})
        
        if (!user) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }

        await db("users").del().where({id: idToDelete})

        res.status(200).send({message: "User deletado com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


// ## Tasks
// - GET all tasks
app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const result = await db("tasks")
        res.status(200).send({usuarios: result})
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
  })  

// - POST task
app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const {id, title, description} = req.body
        

        if (typeof id != "string") {
            res.status(400)
            throw new Error("'id' invalido, deve ser uma string")
        }

        if (typeof title != "string") {
            res.status(400)
            throw new Error("'title' invalido, deve ser uma string")
        }
  
        if (typeof description != "string") {
            res.status(400)
            throw new Error("'description' invalido, deve ser uma string")
        }
  
        if (id.length < 4 || title.length < 2) {
            res.status(400)
            throw new Error("'id' deve ter pelo menos 4 caracteres ou 'title' deve ter no mínimo 2 caracteres")
        }
  
        const [taskIdAlreadyExists]: TTaskDB[] | undefined[] = await db("tasks").where({id})
        
        if (taskIdAlreadyExists) {
            res.status(400)
            throw new Error("'taskId' já existe")
        }

          const newTask = { 
              id, 
              title,
              description
          }
  
          await db("tasks").insert(newTask)

          const [insertedTask]: TTaskDB[] = await db("tasks").where({id})
  
        res.status(201).send({
            message: `Cadastrado de tarefa realizado com sucesso`, 
            tarefa: insertedTask
        })
  
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// - PUT task by id
app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        if (idToEdit[0] !== "t") {
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't'")
        }

        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.created_at
        const newStatus =  req.body.status


        if (newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir no mínimo 4 caracteres")
            }
        }

        if (newTitle !== undefined) {
            if (typeof newTitle !== "string") {
                res.status(400)
                throw new Error("'title' deve ser string")
            }

            if (newTitle.length < 2) {
                res.status(400)
                throw new Error("'title' deve possuir no mínimo 2 caracteres")
            }
        }

        if (newDescription !== undefined) {
            if (typeof newDescription !== "string") {
                res.status(400)
                throw new Error("'description' deve ser string")
            }
        }

        if (newCreatedAt !== undefined) {
            if (typeof newCreatedAt !== "string") {
                res.status(400)
                throw new Error("'created_at' deve ser string")
            }
        }

        if (newStatus !== undefined) {
            if (typeof newStatus !== "number") {
                res.status(400)
                throw new Error("'status' deve ser um number")
            }
        }

        const [ task ]: TTaskDB[] | undefined[]= await db("tasks").where({id: idToEdit})

        if (!task) {
            res.status(404)
            throw new Error ("'id' não encontrada")
        }
        
        const updatedTask: TTaskDB = { 
            id: newId || task.id,
            title: newTitle || task.title,
            description: newDescription || task.description,
            created_at: newCreatedAt || task.created_at,
            status: isNaN(newStatus) ? task.status : newStatus
        }
    
        await db("tasks").update(updatedTask).where({ id: idToEdit })
  

        res.status(200).send({ message: "Atualização realizada com sucesso" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// - DELETE task by id
app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "t") {
            res.status(400)
            throw new Error("'idToDelete' deve iniciar com a letra 't'")
        }

        const [task]: TTaskDB[] | undefined[] = await db("tasks").where({id: idToDelete})
        
        if (!task) {
            res.status(400)
            throw new Error("'taskId' não encontrada")
        }

        await db("tasks").del().where({id: idToDelete})

        res.status(200).send({message: "Tarefa deletada com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// ## Users + Tasks
// - GET all users with tasks
app.get("/tasks/users", async (req: Request, res: Response) => {
    try {
        const result = await db("tasks")
        .leftJoin("users_tasks", "users_tasks.task_id", "=", "tasks.id")
        .leftJoin("users", "users_tasks.user_id", "=", "users.id")

        res.status(200).send({"Usuarios com tarefas": result})

    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
  })

// - POST user to task by ids
app.post("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId
        const userId = req.params.userId

        if (taskId[0] !== "t") {
            res.status(400)
            throw new Error("'taskId' deve iniciar com a letra 't'")
        }

        if (userId[0] !== "f") {
            res.status(400)
            throw new Error("'userId' deve iniciar com a letra 'f'")
        }

        const [task]: TTaskDB[] | undefined[] = await db("tasks").where({id: taskId})
        
        if (!task) {
            res.status(400)
            throw new Error("'taskId' não encontrada")
        }

        const [user]: TUserDB[] | undefined[] = await db("users").where({id: userId})
        
        if (!user) {
            res.status(400)
            throw new Error("'taskId' não encontrada")
        }
       
          const newUserTask: TUserTaskDB = { 
              task_id: taskId,
              user_id: userId
          }
  
          await db("users_tasks").insert(newUserTask)
  
        res.status(200).send(`User atribuido a tarefa com sucesso`)
  
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
  })


// - DELETE user from task by ids
app.delete("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskIdToDelete = req.params.taskId
        const userIdToDelete = req.params.userId

        if (taskIdToDelete[0] !== "t") {
            res.status(400)
            throw new Error("'taskId' deve iniciar com a letra 't'")
        }

        if (userIdToDelete[0] !== "f") {
            res.status(400)
            throw new Error("'userId' deve iniciar com a letra 'f'")
        }

        const [task]: TTaskDB[] | undefined[] = await db("tasks").where({id: taskIdToDelete})
        
        if (!task) {
            res.status(400)
            throw new Error("'taskId' não encontrada")
        }

        const [user]: TUserDB[] | undefined[] = await db("users").where({id: userIdToDelete})
        
        if (!user) {
            res.status(400)
            throw new Error("'taskId' não encontrada")
        }
       
          await db("users_tasks").del()
          .where({task_id: taskIdToDelete})
          .andWhere({user_id: userIdToDelete})
  
        res.status(200).send({message: "user removido da tarefa com sucesso"})
  
    } catch (error) {
        console.log(error)
  
        if (req.statusCode === 200) {
            res.status(500)
        }
  
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
  })
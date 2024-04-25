const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const {format} = require('date-fns')
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
//---------Initialize server---------------//
const initializeServers = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3004, () => {
      console.log('Server is successfully started')
    })
  } catch (e) {
    console.log(`Database Error${e.message}`)
  }
}

const validPriorities = ['HIGH', 'MEDIUM', 'LOW']
const validStatuses = ['TO DO', 'IN PROGRESS', 'DONE']
const validCategories = ['WORK', 'HOME', 'LEARNING']

const isValidPriority = priority => {
  return validPriorities.includes(priority)
}

const isValidStatus = status => {
  return validStatuses.includes(status)
}

const isValidCategory = category => {
  return validCategories.includes(category)
}

const isValidDueDate = dueDate => {
  return /\d{4}-\d{2}-\d{2}/.test(dueDate)
}

app.get('/', async (request, response) => {
  const getAllItemsQuery = `
    Select * From todo;
    `
  const response_get_all_items = await db.all(getAllItemsQuery)
  response.send(response_get_all_items)
})
initializeServers()
//-----------------API-1-----------//
app.get('/todos/', async (request, response) => {
  const {
    status = '',
    priority = '',
    search_q = '',
    category = '',
  } = request.query
  const status_getItems_query = `
  SELECT * FROM todo
  WHERE
  status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%' AND category LIKE '%${category}%';
  `
  const response_query_status = await db.all(status_getItems_query)
  response.send(response_query_status)
})
//----------API-2-------------//
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  SELECT * FROM todo
  WHERE
  id=${todoId}
  `
  const response_todo_id = await db.get(getTodoQuery)
  response.send(response_todo_id)
})
//-------------Api-3--------------//
app.get('/agenda/', async (request, response) => {
  const {date = ''} = request.query
  const inputDate = new Date(date)
  const formattedDate = format(inputDate, 'yyyy-MM-dd')
  const agenda_date_query = `
  SELECT * FROM todo
  WHERE 
  due_date LIKE '%${formattedDate}%';
  `
  const response_agenda = await db.all(agenda_date_query)
  response.send(response_agenda)
})
//--------API-4--------//
app.post('/todos/', async (request, response) => {
  try {
    const postingDetails = request.body
    const {id, todo, priority, status, category, dueDate} = postingDetails
    if (!isValidPriority(priority)) {
      return response.status(400).send('Invalid Todo Priority')
    }
    if (!isValidStatus(status)) {
      return response.status(400).send('Invalid Todo Status')
    }
    if (!isValidCategory(category)) {
      return response.status(400).send('Invalid Todo Category')
    }
    if (!isValidDueDate(dueDate)) {
      return response.status(400).send('Invalid Due Date')
    }
    const post_query = `
  INSERT INTO todo(id,todo,priority,status,category,due_date)
  VALUES(
    '${id}',
    '${todo}',
    '${priority}',
    '${status}',
    '${category}',
    '${dueDate}'
  );
  `
    await db.run(post_query)
    response.send('Todo Successfully Added')
  } catch (e) {
    console.log(`Db Error :${e.message}`)
  }
})
//------------APi-5---------//
app.put('/todos/:todoId/', async (request, response) => {
  try {
    const updatingDetails = request.body
    const {status, priority, todo, category, dueDate} = updatingDetails
    const {todoId} = request.params

    let dbQuerY_update
    console.log(status)
    switch (true) {
      case status !== undefined:
        if (!isValidStatus(status)) {
          return response.status(400).send('Invalid Todo Status')
        }
        dbQuerY_update = `
        UPDATE todo
        SET
        status='${status}'
        WHERE
        id=${todoId};
        `
        await db.run(dbQuerY_update)
        response.send('Status Updated')
        break
      case priority !== undefined:
        if (!isValidPriority(priority)) {
          return response.status(400).send('Invalid Todo Priority')
        }
        dbQuerY_update = `
        UPDATE todo
        SET
        priority='${priority}'
        WHERE
        id=${todoId};
        `
        await db.run(dbQuerY_update)
        response.send('Priority Updated')
        break
      case todo !== undefined:
        dbQuerY_update = `
        UPDATE todo
        SET
        todo='${todo}'
        WHERE
        id=${todoId};
        `
        await db.run(dbQuerY_update)
        response.send('Todo Updated')
        break
      case category !== undefined:
        if (!isValidCategory(category)) {
          return response.status(400).send('Invalid Todo Category')
        }
        dbQuerY_update = `
        UPDATE todo
        SET
        category='${category}'
        WHERE
        id=${todoId};
        `
        await db.run(dbQuerY_update)
        response.send('Category Updated')
        break
      case dueDate !== undefined:
        if (!isValidDueDate(dueDate)) {
          return response.status(400).send('Invalid Due Date')
        }
        dbQuerY_update = `
        UPDATE todo
        SET
        due_date='${dueDate}'
        WHERE
        id=${todoId};
        `
        await db.run(dbQuerY_update)
        response.send('Due Date Updated')
        break
    }
  } catch (e) {
    console.log(e.message)
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
  DELETE FROM todo
  WHERE id=${todoId};
  `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})
module.exports = app

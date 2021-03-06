- ## Send data from react to mongodb
(1): React site (Send data from react to mongodb)
```
import React, { useRef } from 'react';

const AddUser = () => {
    const nameRef = useRef(); 
    const emailRef = useRef();

    const handleAddUser = e => {
        const name = nameRef.current.value;
        const email = emailRef.current.value;
        const newUser = {name: name, email: email};

        fetch('http://localhost:5000/users', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(newUser)
            })
        .then(res => res.json())
        .then(data => {
            if(data.insertedId){
                alert('Successfully added user');
                e.target.reset();
            }
        })

        e.preventDefault();
    }
    return (
    <div>
        <h2>Please Add an User</h2>
        <form onSubmit={handleAddUser}>
            <input type="text" ref={nameRef} placeholder="Name" />
            <input type="email" ref={emailRef} placeholder="Email" />
            <input type="submit" value="Submit" />
        </form>
    </div>
    );
};

export default AddUser;
```
(2): Server Site (Send data from react to mongodb)
```
app.post('/users', async (req, res) =>{
  const newUser = req.body;
  const result = await usersCollection.insertOne(newUser);
  res.send(result);
})
```

- ## Getting data from Mongodb
```
app.get('/users', async (req, res) =>{
    console.log('/users hitting from Browser');
    const cursor = usersCollection.find({});
    const users = await cursor.toArray();
    res.send(users);
})
```

- ## Delete data from Mongodb
(1): React Site Coding (Delete data from Mongodb)
```
const handleDeleteUser = id => {
    const url = `http://localhost:5000/users/${id}`;
    fetch(url, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
        if(data.deletedCount > 0){
            alert('Deleted Successfully');
            const remainingUsers = users.filter( user => user._id !== id);
            setUsers(remainingUsers);
        }
    })
}
<button onClick={() => handleDeleteUser(user._id)}>&#10007;</button>
```

(2): Server site (Delete data from Mongodb)
```
app.delete('/users/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await usersCollection.deleteOne(query);
    console.log('Deleting user with id', result);
    res.json(result);
})
```

- ## Update User(Get only one id user)
* (1, a) React site [Update User(Get only one id user)]
```
const { id } = useParams();
const [user, setUser] = useState({});
useEffect( () => {
    const url = `http://localhost:5000/users/${id}`;
    fetch(url)
    .then(res => res.json())
    .then(data => setUser(data))
}, [])
```

(2, a) Server site [Update User(Get only one id user)]
```
app.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const user = await usersCollection.findOne(query);
    console.log('/users/:id ', id);
    res.send(user);
});
```

* (1, b) React site [Update User(Get only one id user)]
```
//Update Email
const handleEmailChange = e => {
    const updatedEmail = e.target.value;
    // const updatedUser = {...user};
    // updatedUser.email = updatedEmail;
    const updatedUser = {name: user.name, email: updatedEmail};
    setUser(updatedUser);
}
const handleUpdateUser = e => {
    const url = `http://localhost:5000/users/${id}`;
    fetch(url, {
        method: 'PUT',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(user)
    })
    .then( res => res.json())
    .then(data => {
        if(data.modifiedCount > 0){
            alert('Updated Successfully')
        }
    })
    e.preventDefault();
}
```
* (2, b) Server site [Update User(Get only one id user)]
```
app.put('/users/:id', async (req, res) =>{
    const id = req.params.id;
    const updatedUser = req.body;
    const filter = {_id: ObjectId(id)};
    const options = {upsert : true};
    const updateDoc = { $set: { name: updatedUser.name, email: updatedUser.email }};
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    console.log('Updating user', req.body);
    res.json(result);
})
```

- ### Client site full coding
```
const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://testdb1:Sm05e8nYrGmWrzMe@cluster0.e97ot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("testSite");
    const usersCollection = database.collection("users");
  
  //Get from Mongodb
  app.get('/users', async (req, res) =>{
    console.log('/users hitting from Browser');
    const cursor = usersCollection.find({});
    const users = await cursor.toArray();
    res.send(users);
  })

  //Post in Mongodb
  app.post('/users', async (req, res) =>{
    const newUser = req.body;
    const result = await usersCollection.insertOne(newUser);
    res.send(result);
  })

  //Delete from Mongodb
  app.delete('/users/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await usersCollection.deleteOne(query);
    console.log('Deleting user with id', result);
    res.json(result);
  })

  app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const user = await usersCollection.findOne(query);
      console.log('/users/:id ', id);
      res.send(user);
  });

  //Update Api
  app.put('/users/:id', async (req, res) =>{
    const id = req.params.id;
    const updatedUser = req.body;
    const filter = {_id: ObjectId(id)};
    const options = {upsert : true};
    const updateDoc = { $set: { name: updatedUser.name, email: updatedUser.email }};
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    console.log('Updating user', req.body);
    res.json(result);
  })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running my card server')
    console.log('Running my card server');
})

app.listen(port, () => {
    console.log('Running server on port', port);
});
```

- ### App.js
```
<BrowserRouter>
    <Header />
    <Switch>
        <Route exact path='/'>
        <Home />
        </Route>
        <Route exact path='/users'>
        <Users />
        </Route>
        <Route path='/users/add'>
        <AddUser />
        </Route>
        <Route path='/users/update/:id'>
        <UpdateUser />
        </Route>
    </Switch>
</BrowserRouter>
```

- ### Header.js
```
import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';


const Header = () => {
    return (
        <div className='header'>
            <nav>
                <Link to='/'>Home</Link>
                <Link to='/users'>Users</Link>
                <Link to='/users/add'>Add User</Link>
            </nav>
        </div>
    );
};

export default Header;
```


- ### AddUser.js
```
import React, { useRef } from 'react';

const AddUser = () => {
    const nameRef = useRef(); 
    const emailRef = useRef();

    const handleAddUser = e => {
        const name = nameRef.current.value;
        const email = emailRef.current.value;
        const newUser = {name: name, email: email};

        fetch('http://localhost:5000/users', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(newUser)
            })
        .then(res => res.json())
        .then(data => {
            if(data.insertedId){
                alert('Successfully added user');
                e.target.reset();
            }
        })

        e.preventDefault();
    }
    return (
    <div>
        <h2>Please Add an User</h2>
        <form onSubmit={handleAddUser}>
            <input type="text" ref={nameRef} placeholder="Name" />
            <input type="email" ref={emailRef} placeholder="Email" />
            <input type="submit" value="Submit" />
        </form>
    </div>
    );
};

export default AddUser;
```

- ### Users.js
```
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect( () => {
        fetch('http://localhost:5000/users')
        .then(res => res.json())
        .then(data => setUsers(data))
    }, []);

    //Delete an User and need to add const ObjectId = require('mongodb').ObjectId; in mongodb index,js
    const handleDeleteUser = id => {
        const url = `http://localhost:5000/users/${id}`;
        fetch(url, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if(data.deletedCount > 0){
                alert('Deleted Successfully');
                const remainingUsers = users.filter( user => user._id !== id);
                setUsers(remainingUsers);
            }
        })
    }
    return (
        <div style={{textAlign: 'left'}}>
            <h2>Available Users: {users.length}</h2>
            <ul>
                {
                    users.map(user => <li style={{paddingBottom: '5px'}} 
                        key={user._id}
                        user={user}>
                           <b>Name</b>: {user.name}, <b>Email</b>: {user.email}
                           &nbsp;
                           <Link to={`/users/update/${user._id}`}><button>&#10003;</button></Link>
                           &nbsp; 
                           <button onClick={() => handleDeleteUser(user._id)}>&#10007;</button>
                        </li>)
                }
            </ul>
        </div>
    );
};

export default Users;
```

- ### UpdateUser.js
```
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect( () => {
        fetch('http://localhost:5000/users')
        .then(res => res.json())
        .then(data => setUsers(data))
    }, []);

    //Delete an User and need to add const ObjectId = require('mongodb').ObjectId; in mongodb index,js
    const handleDeleteUser = id => {
        const url = `http://localhost:5000/users/${id}`;
        fetch(url, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if(data.deletedCount > 0){
                alert('Deleted Successfully');
                const remainingUsers = users.filter( user => user._id !== id);
                setUsers(remainingUsers);
            }
        })
    }
    return (
        <div style={{textAlign: 'left'}}>
            <h2>Available Users: {users.length}</h2>
            <ul>
                {
                    users.map(user => <li style={{paddingBottom: '5px'}} 
                        key={user._id}
                        user={user}>
                           <b>Name</b>: {user.name}, <b>Email</b>: {user.email}
                           &nbsp;
                           <Link to={`/users/update/${user._id}`}><button>&#10003;</button></Link>
                           &nbsp; 
                           <button onClick={() => handleDeleteUser(user._id)}>&#10007;</button>
                        </li>)
                }
            </ul>
        </div>
    );
};

export default Users;
```





# Mongodb-Simple

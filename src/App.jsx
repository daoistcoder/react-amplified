import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';

import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

import {
  withAuthenticator,
  Button,
  Heading,
  Text,
  TextField,
  View
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const initialState = { name: '', description: '' };
const client = generateClient();

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <div style={styles.body}>
      <View style={styles.navBar}>
        <Heading level={1}>Hello {user.username}</Heading>
        <Button style={styles.signOutButton} onClick={signOut}>
          Sign out
        </Button>
      </View>
      <View style={styles.container}>
        <Heading level={2}>Amplify Todos</Heading>
        <TextField
          placeholder="Name"
          onChange={(event) => setInput('name', event.target.value)}
          style={styles.input}
          defaultValue={formState.name}
        />
        <TextField
          placeholder="Description"
          onChange={(event) => setInput('description', event.target.value)}
          style={styles.input}
          defaultValue={formState.description}
        />
        <Button style={styles.button} onClick={addTodo}>
          Create Todo
        </Button>
        {todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{"- " + todo.description}</Text>
          </View>
        ))}
      </View>
    </div>
  );
};

const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'start',
    gap: '20vh',
    height: '100vh',
    width: '100vw', // Add this line
    margin: 0,
    padding: 0,
    backgroundColor: '#f0f0f0',
  },
  navBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '10vh',
    width: '100vw',
    margin: '0 auto',
    border: '1px solid #ccc', // Add a border
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', // Add a box-shadow
    borderRadius: '5px',
    padding: '2vh 1vw 2vh 3vw',
  },
  container: {
    width: 500,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: '1px solid #ccc', // Add a border
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', // Add a box-shadow
    borderRadius: '5px',
    padding: 20
  },
  todo: {
    marginBottom: 5,
    padding: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'start',
    gap: '10px',
    border: '1px solid #ccc', // Add a border
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', // Add a box-shadow
    borderRadius: '5px',
  },
  input: {
    border: 'none',
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18
  },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: 'black',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '12px 0px',
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: 'black',
    height: '50px',
    width: '100px',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '2px 0px',
    borderRadius: '15px',
    marginBottom: 10,
  }
};

export default withAuthenticator(App);
# State Data API

A RESTful API for accessing and managing U.S. state data, including fun facts, built with **TypeScript**, **MongoDB**, **Express**, and **Mongoose**.

## 🛠 Technologies Used
- Node.js / Express
- TypeScript
- MongoDB / Mongoose

---

## 📚 Endpoints

### `GET /states`
Returns all U.S. state data, including fun facts.

#### Optional Query Parameter:
- `isContig=true` — Returns only the 48 contiguous states.
- `isContig=false` — Returns only Alaska and Hawaii.

---

### `GET /states/:state`
Returns complete data for a single state.  
`:state` its 2-letter abbreviation.

---

### `GET /states/:state/:property`
Returns a single property about the state.

#### Supported `:property` values:
- `funfact` — Returns a **random** fun fact.
- `capital`
- `nickname`
- `population`
- `admission`

---

### `POST /states/:state/funfact`
Adds one or more fun facts to a state.

#### Example Request Body:
```json
{
  "funfacts": [
    "This is a state.",
    "This is a fact."
  ]
}
```

### `PATCH /states/:state/funfact`

Update a specific fun fact for a state by its index.

**Request Parameters:**
- `:state` — The full state name or its two-letter code (e.g., `missouri` or `MO`).

**Request Body:**
```json
{
  "index": 1,
  "funfact": "This is an updated fun fact."
}

```
### DELETE /states/:state/funfact

Delete a specific fun fact for a state by its index.

**Request Parameters:**
- `:state` — The full state name or its two-letter code.

**Request Body:**
```json
{
  "index": 1
}
# Tools I Used
- Claude (claude.ai & claude code)
- Cursor (including agent)

# Tasks I gave AI
- JSX was primarily written by AI due to time constraint and repetitive nature, created the markup and Tailwind styling
- Handler functions that primarily dealt with calculation logic in orders page & some in dashboard
* AI mainly helped with UI markup and complex functions when I was pressed for time

# What I wrote myself
- All the TS types
- In-memory order store
- API route handlers
- Some of the handler functions
- States & useEffect
* Most of the things I wrote was logic and the data layer.

# Where AI got something wrong
- PATCH route used the old Next.js params syntax causing an error in the newer version. Error was caught in the terminal and was fixed by awaiting params as a Promise (using claude code)
- In handleCheckout function, I wrote 'http://localhost:3000/api/orders' not knowing Next.js doesnt require the full URL, AI failed to pick up on that and didnt realize until later [also other instances of AI not picking up simple errors]


import "./styles.css";
import React from 'react';
import axios from 'axios';

const ACTIONTERMS ={
   STORY_FETCH_INIT:'STORY_FETCH_INIT',
   STORY_FETCH_SUCCESS:'STORY_FETCH_SUCCESS',
   STORY_FETCH_FAILURE:'STORY_FETCH_FAILURE',
   REMOVE_STORY:'REMOVE_STORY',
}
 
const API_ENDPOINT ='https://hn.algolia.com/api/v1/search?query=';     //url for fetching data


const useSemiPersistentState = (key,initialState) =>{
  const[value,setValue]=React.useState(localStorage.getItem(key) || initialState)
  React.useEffect(()=>{
    localStorage.setItem(key,value)
  },[value,key])
  return [value,setValue]
}

const storiesReducer=(state,action)=>{
  switch(action.type){
    case ACTIONTERMS.STORY_FETCH_INIT:
      return {
        ...state,
        isLoading:true,
        isError:false,
      }
      case ACTIONTERMS.STORY_FETCH_SUCCESS:
        return{
          ...state,
          isLoading:false,
          isError:false,
          data:action.payload,
        }
      case ACTIONTERMS.STORY_FETCH_FAILURE:
        return{
          ...state,
          isLoading:false,
          isError:true,
        }
      case ACTIONTERMS.REMOVE_STORY:
        return{
          ...state,
          data: state.data.filter(story => action.payload.objectID !== story.objectID),
        }
      default:
        throw new Error();
  }
}

export default function App() {
const [searchTerm,setSearchTerm]=useSemiPersistentState('search','React')

const [stories,dispatchStories]=React.useReducer(storiesReducer,{ data :[],isLoading: false,isError: false})

const [url,setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`) 

// const handleFetchStories =React.useCallback(()=>{
  // console.log("function")
  // if(!searchTerm) return;
  // dispatchStories({
  //   type:ACTIONTERMS.STORY_FETCH_INIT
  // })
  // fetch(url)                                                  //fetching data with browers native fetch API
  //  .then(response=> response.json())
  //  .then(result=> {
    //    dispatchStories({
    //      type:ACTIONTERMS.STORY_FETCH_SUCCESS,
    //      payload:result.hits,
    //    })
//   //  })
//   axios.get(url)                                              //fetching data with 3rd party library called axios
//   .then(result=>{
//     dispatchStories({
//         type:ACTIONTERMS.STORY_FETCH_SUCCESS,
//         payload:result.data.hits,
//       })
//   })
//    .catch(()=>
//    dispatchStories({type:ACTIONTERMS.STORY_FETCH_FAILURE}))
// },[url])

const handleFetchStories=React.useCallback(async ()=>{
  dispatchStories({
        type:ACTIONTERMS.STORY_FETCH_INIT
      })
    const result = await axios.get(url)
  try{
    dispatchStories({
              type:ACTIONTERMS.STORY_FETCH_SUCCESS,
              payload:result.data.hits,
            })
  }
  catch{
    dispatchStories({type:ACTIONTERMS.STORY_FETCH_FAILURE})
  };
},[url])

React.useEffect(()=>{
  // console.log("effect")
  handleFetchStories()
},[handleFetchStories])



const handleRemoveStory = item =>{
  dispatchStories({
    type: ACTIONTERMS.REMOVE_STORY,
    payload: item,
  })
  
}
const handleSearchInput = (event)=>{
  setSearchTerm(event.target.value)
}
const handleSearchSubmit=()=>{
  setUrl(`${API_ENDPOINT}${searchTerm}`)
}
  return (
    <>
      <InputWithlabel id="search"
                      value={searchTerm}
                      isFocused
                      onInputChange={handleSearchInput}>
                         <strong>Search:</strong>
                         <button type="button"
                                 disabled={!searchTerm}
                                onClick={handleSearchSubmit}
                          >
                           Submit
                        </button>
      </InputWithlabel>
  {stories.isLoading?( <p>Loading......</p> ) : (<List list={stories.data} onRemoveItem={handleRemoveStory}/>)}
  {stories.isError && <p> something went wrong.....</p>}
      
    </>
  );
}

const InputWithlabel = ({id,value,type="text",isFocused,onInputChange,children})=>{
  const inputRef = React.useRef();
  React.useEffect(()=>{
    if(isFocused){
      inputRef.current.focus()
    }
  },[inputRef])
return (
  <> 
    <label htmlFor={id}>{children}</label>
    &nbsp;
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={onInputChange}
      />
  </>
)
}

const List = ({ list, onRemoveItem })=>
      list.map(item=>(
          <Item key={item.objectID}
                item={item}
                onRemoveItem={onRemoveItem}
          />
        )
      )


const Item=({item,onRemoveItem})=>{
  return(
          <div>
                <span><a href={item.url}> |{item.title} |</a></span>
                <span>     |{item.author}| </span>
                <span>     |{item.num_comments}| </span>
                <span>     |{item.points}| </span>  
                <span>     <button type="button" onClick={()=>onRemoveItem(item)}>Dismiss</button></span>
          </div>
  )
}




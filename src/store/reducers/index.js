import { combineReducers } from "redux"
import { CHANGE_TAG_STATUS } from "../actions"

const initState = {
  tag: false
}

function tagReducer (state = initState, action) {
  switch (action.type) {
    case CHANGE_TAG_STATUS:
      return {
        ...state,
        tag: action.payload.tag
      }
    default:
      return state
  }
}

export default combineReducers({
  tagReducer
})
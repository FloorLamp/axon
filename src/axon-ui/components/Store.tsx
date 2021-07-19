import { HttpAgent } from "@dfinity/agent";
import React, { createContext, useContext, useReducer } from "react";
import { canisterId, createActor } from "../declarations/Axon";
import { AxonService } from "../lib/types";

type Action = {
  type: "SET_AGENT";
  agent: HttpAgent | null;
  isAuthed?: boolean;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_AGENT":
      const agent = action.agent || defaultAgent;
      return {
        ...state,
        agent,
        axon: createActor(canisterId, agent),
        isAuthed: !!action.isAuthed,
      };
    default:
      return state;
  }
};

type State = {
  agent: HttpAgent;
  axon: AxonService;
  isAuthed: boolean;
};

const defaultAgent = new HttpAgent({ host: "https://ic0.app" });
const initialState: State = {
  agent: defaultAgent,
  axon: createActor(canisterId, defaultAgent),
  isAuthed: false,
};

const Context = createContext({
  state: initialState,
  dispatch: (_: Action) => null,
});

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
};

export const useAxon = () => {
  const context = useGlobalContext();
  return context.state.axon;
};

export default Store;

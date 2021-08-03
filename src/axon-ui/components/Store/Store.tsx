import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import React, { createContext, useContext, useReducer } from "react";
import { canisterId, createActor } from "../../declarations/Axon";
import { defaultAgent } from "../../lib/canisters";
import { AxonService } from "../../lib/types";

type Action =
  | {
      type: "SET_AGENT";
      agent: HttpAgent | null;
      isAuthed?: boolean;
    }
  | {
      type: "SET_PRINCIPAL";
      principal: Principal;
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
    case "SET_PRINCIPAL":
      return {
        ...state,
        principal: action.principal,
      };
  }
};

type State = {
  agent: HttpAgent;
  axon: AxonService;
  isAuthed: boolean;
  principal: Principal | null;
};

const initialState: State = {
  agent: defaultAgent,
  axon: createActor(canisterId, defaultAgent),
  isAuthed: false,
  principal: null,
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
    throw new Error("useGlobalContext must be used within a CountProvider");
  }
  return context;
};

export const useAxon = () => {
  const context = useGlobalContext();
  return context.state.axon;
};

export const useSetAgent = () => {
  const { dispatch } = useGlobalContext();

  return async ({
    agent,
    isAuthed,
  }: {
    agent: HttpAgent;
    isAuthed?: boolean;
  }) => {
    dispatch({ type: "SET_AGENT", agent, isAuthed });
    if (isAuthed) {
      dispatch({
        type: "SET_PRINCIPAL",
        principal: await agent.getPrincipal(),
      });
    } else {
      dispatch({ type: "SET_PRINCIPAL", principal: null });
    }
  };
};

export default Store;

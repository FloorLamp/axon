import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import React, { createContext, useContext, useEffect, useReducer } from "react";
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
    }
  | {
      type: "LOAD_PERSISTENT_STATE";
      value: State["persistent"];
    }
  | {
      type: "SET_HIDE_ZERO_BALANCES";
      value: boolean;
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
    case "LOAD_PERSISTENT_STATE":
      return {
        ...state,
        persistent: action.value,
      };
    case "SET_HIDE_ZERO_BALANCES":
      return {
        ...state,
        persistent: {
          ...state.persistent,
          hideZeroBalances: action.value,
        },
      };
  }
};

type State = {
  agent: HttpAgent;
  axon: AxonService;
  isAuthed: boolean;
  principal: Principal | null;
  persistent: {
    hideZeroBalances: boolean;
  };
};

const initialState: State = {
  agent: defaultAgent,
  axon: createActor(canisterId, defaultAgent),
  isAuthed: false,
  principal: null,
  persistent: {
    hideZeroBalances: true,
  },
};

const Context = createContext({
  state: initialState,
  dispatch: (_: Action) => null,
});

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("state");
      if (stored) {
        const value = JSON.parse(stored);
        dispatch({ type: "LOAD_PERSISTENT_STATE", value });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("state", JSON.stringify(state.persistent));
    }
  }, [state.persistent]);

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

export const useHideZeroBalances = () => {
  const context = useGlobalContext();

  const state = context.state.persistent.hideZeroBalances;
  const dispatch = (value: boolean) =>
    context.dispatch({ type: "SET_HIDE_ZERO_BALANCES", value });

  return [state, dispatch] as const;
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
      const principal = await agent.getPrincipal();
      console.log("authed", principal.toText());

      dispatch({
        type: "SET_PRINCIPAL",
        principal,
      });
    } else {
      dispatch({ type: "SET_PRINCIPAL", principal: null });
    }
  };
};

export default Store;

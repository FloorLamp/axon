import { useCallback, useEffect, useRef, useState } from "react";

export default function useStateCallback<T>(
  initialState: T
): [T, (state: T, cb: (args: T) => any) => void] {
  const [state, setState] = useState(initialState);
  const cbRef = useRef(null);

  const setStateCallback = useCallback((state: T, cb: (args: T) => any) => {
    cbRef.current = cb;
    setState(state);
  }, []);

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null;
    }
  }, [state]);

  return [state, setStateCallback];
}

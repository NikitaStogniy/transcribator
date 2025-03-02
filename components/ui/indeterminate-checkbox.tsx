import React, { useEffect, useRef, forwardRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ComponentPropsWithoutRef } from "react";

interface IndeterminateCheckboxProps
  extends ComponentPropsWithoutRef<typeof Checkbox> {
  indeterminate?: boolean;
}

export const IndeterminateCheckbox = forwardRef<
  HTMLButtonElement,
  IndeterminateCheckboxProps
>(function IndeterminateCheckbox(
  { indeterminate = false, ...props },
  forwardedRef
) {
  const innerRef = useRef<HTMLButtonElement>(null);

  // Use the forwardedRef if provided, otherwise fallback to innerRef
  const resolvedRef =
    (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>) ||
    innerRef;

  useEffect(() => {
    if (!resolvedRef.current) return;

    // DOM nodes in React don't have the indeterminate property in their types
    // We need to use this workaround
    if (indeterminate) {
      resolvedRef.current.dataset.state = "indeterminate";
      resolvedRef.current.setAttribute("data-state", "indeterminate");
    }
  }, [indeterminate, resolvedRef]);

  return <Checkbox ref={resolvedRef} {...props} />;
});

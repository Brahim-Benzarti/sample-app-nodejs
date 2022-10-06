import { Text, Table, Badge } from "@bigcommerce/big-design";
import { useState } from "react";
import { Transition } from 'react-transition-group';
import { Status } from "../../types/misc";

const duration = 300;

const defaultStyle = {
  height: 0,
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 1, height: 'auto' },
  entered:  { opacity: 1, height: 'auto' },
  exiting:  { opacity: 0 },
  exited:  { opacity: 0 },
};

interface StatusProps {
  stats: Status[],
}

const StatusC = ({stats}: StatusProps) =>{
  const [inAction, setInAction] = useState(true);
  if(!stats) return <></>;
  return (
    <Transition in={inAction}>
    {state => (
      <Table
        style={{
          ...defaultStyle,
          ...transitionStyles[state]
        }}
        headerless
        columns={[
          { header: 'Message', hash: 'message', render: ({ message }) => <Text>{message}</Text> },
          { header: 'Badge', hash: 'badge', render: ({ badge, label }) => <Badge label={label} variant={badge} /> },
        ]}
        items={stats}
      />
    )}
  </Transition>
  )
}

export default StatusC;
import { Flex, FlexItem, H3, Panel, ProgressCircle, Stepper, Switch } from "@bigcommerce/big-design";
import { Transition } from 'react-transition-group';
import { useState } from "react";
import { Webhook } from "../../types";
import StatusC from "./status";

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

interface WebHookProps {
  name: string,
  webhook: Webhook,
  onChange(scope: string): any,
  scope: string
}

const WebHook = ({name, webhook, onChange, scope}: WebHookProps) =>{
  const [inAction, setInAction] = useState(webhook?.is_active || false);
  const steps = ['Syncing existing data', 'Activating webhook', 'Activated'];
  const handleChange = () =>{
    setInAction(!(webhook?.is_active || false))
    onChange(scope)
  }

  return (
    <Panel id={ name.toLowerCase() }>
      <Flex justifyContent={'space-between'}>
        <FlexItem>
          <H3>{ name }</H3>
        </FlexItem>
        <FlexItem>
          <Switch checked={ webhook?.is_active || false } onChange={ handleChange }></Switch>
        </FlexItem>
      </Flex>
      <Transition in={inAction}>
        {state => (
          <div style={{
            ...defaultStyle,
            ...transitionStyles[state]
          }}>
            <Stepper currentStep={ (webhook?.addon?.step ?? (webhook?.is_active ? steps.length : 0)) || 0 } steps={ steps } />
            <StatusC stats={webhook?.addon?.stats} />
            { webhook?.is_active ? <></> : <div style={{width: '100%', marginTop: '30px'}}><div style={{width: 'fit-content', marginLeft: 'auto'}}><ProgressCircle size="small" /></div></div> }
          </div>
        )}
      </Transition>
    </Panel>
  )
}

export default WebHook;
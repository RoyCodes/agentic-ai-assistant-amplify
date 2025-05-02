import { Authenticator } from "@aws-amplify/ui-react"
import "@aws-amplify/ui-react/styles.css"
import "./index.css"
import Inflicter from "./Troubleshooter"
import { Button, View} from '@aws-amplify/ui-react';

function App() {

  return (
    <Authenticator>
    {({ signOut }) => (
      <View
        as="main"
      >  
        <Inflicter />
        <Button onClick={signOut}> Sign out </Button>
      </View>
      )}
    </Authenticator>
  );
}

export default App;
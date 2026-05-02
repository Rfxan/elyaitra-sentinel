import { Route, Switch } from "wouter";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Tutor from "./pages/Tutor";
import Subjects from "./pages/Subjects";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/signup" component={Signup} />
      <Route path="/tutor" component={Tutor} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/payment" component={Payment} />
      <Route>404 Not Found</Route>
    </Switch>
  );
}

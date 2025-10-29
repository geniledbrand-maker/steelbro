import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/layers.css";

import Navbar from "./components/Navbar/Navbar";
import HeroBanner from "./components/HeroBanner/HeroBanner";

function App() {
    return (
        <>
            <Navbar />
            <HeroBanner />
        </>
    );
}

export default App;
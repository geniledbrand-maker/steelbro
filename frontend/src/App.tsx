import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/layers.css";
import './styles/fonts.css';

import HeroBanner from "./components/HeroBanner/HeroBanner";

function App() {
    return (
        <>
            <HeroBanner /> {/* ✅ Навбар теперь рендерится внутри HeroBanner */}
        </>
    );
}

export default App;

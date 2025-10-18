const Nav = () => {
    return (
        `
        <div class="nav" style="
            position: fixed;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            background: rgba(255,255,255,0.02);">
            <div class="nav-content" style="
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            padding: 10px;
            width: 100%;
            max-width: 800px;">
            <a href="https://40th.onnuri-church.com/"> 
                <img class="nav-logo" src="/assets/images/logo.png" alt="AR Logo" style="width: 40px; height: 40px;"/>
            </a>
            </div>
        </div>
        `
    );
};

export default Nav;
function openNav() {
    document.getElementById("side-bar").style.position = "sticky";
    document.getElementById("side-bar").style.width = "100%";
    document.getElementById("side-bar").style.height = "100vh";
}

function closeNav() {
    document.getElementById("side-bar").style.position = "fixed";
    document.getElementById("side-bar").style.width = "0%";
    document.getElementById("side-bar").style.height = "4.3vh";
}


// w3schools
function hideSideBarButton() {
    var x = document.getElementById("toggle-button");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
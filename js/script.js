const domContainer = document.getElementById("root");

class Main extends React.Component{
    constructor(props){
        super(props);
        this.state={
            search: "Avengers",         //Search bar input
            result: "",                 //Search result response text
            infoWindow: "hide",         //Toggle for movie info overlay
            nomins: {                   //Array of nominations' data
                        poster: [],
                        title: [],
                        year: []
                    }
        };
        this.updateSearch=this.updateSearch.bind(this);
        this.getData=this.getData.bind(this);
        this.getResultsPage=this.getResultsPage.bind(this);
        this.details=this.details.bind(this);
        this.nominSave=this.nominSave.bind(this);
        this.nominDelete=this.nominDelete.bind(this);
    }


    //Read IMDb IDs saved in local storage, and get the movie data from OMDb

    componentDidMount(){
        if(!localStorage.getItem("movieList")){
            return;
        }
        let list=localStorage.getItem("movieList").split(",");
        let poster=[], title=[], year=[]

        for(let i=0; i<list.length; i++){

            let url="http://www.omdbapi.com/?i="+list[i]+"&apikey=62a2f146";

            let file=new XMLHttpRequest();
            file.open("GET", url, false);
            file.send(null);

            let obj=JSON.parse(file.responseText);

            poster=[...poster, obj["Poster"]];
            title=[...title, obj["Title"]];
            year=[...year, obj["Year"]];
        }
        this.setState({
            nomins: {
                        poster: poster,
                        title: title,
                        year: year
                    }
        });
    }


    //Save user input to state

    updateSearch(event){
        this.setState({
            search: event.target.value
        });
    }


    //Get the nth page of search results from OMDb, update state accordingly, and call the next function to display the results

    getData(n){
        let url="http://www.omdbapi.com/?s="+this.state.search+"&page="+n+"&type=movie&apikey=62a2f146";

        let file=new XMLHttpRequest();
        file.open("GET", url, false);
        file.send(null);

        this.setState({
            result: file.responseText
        },()=>{this.getResultsPage(n)});
    }


    //Create DOM elements corresponding to the search results, and navigation button to generate the previous and the next search pages.

    getResultsPage(n){
        ReactDOM.unmountComponentAtNode(document.getElementById("search-results"));

        if(this.state.result==""){
            return;
        }
        let obj=JSON.parse(this.state.result);

        if(obj["Response"]=="False"){
            let errorMsg=React.createElement("h1",{},obj["Error"]);
            ReactDOM.render(errorMsg, document.getElementById("search-results"));
            return;
        }
        let results=[], buttons=[];

        if(n>1){
            buttons.push(React.createElement("button", {className: "search-page prev", onClick: ()=>{this.getData(n-1)}}, React.createElement("i", {className: "fa fa-arrow-left"}, ""), " Previous Page"));
        }

        if(n<=Math.floor(obj.totalResults/10)){
            buttons.push(React.createElement("button", {className: "search-page next", onClick: ()=>{this.getData(n+1)}}, "Next Page ", React.createElement("i", {className: "fa fa-arrow-right"}, "")));
        }
        results.push(React.createElement("div", {class: "button-area upper"}, buttons));

        for(let i=0; i<obj["Search"].length; i++){

            let buttonClass=    localStorage.getItem("movieList")
                                ?(localStorage.getItem("movieList").split(",").includes(obj["Search"][i]["imdbID"])
                                    ?["added","Remove from Nominations"]
                                    :(localStorage.getItem("movieList").split(",").length==5
                                        ?["full","Nominations Full"]
                                        :["add","Add to Nominations"]))
                                :["add","Add to Nominations"]

            let resultItem=React.createElement("div",{className: "result", id: obj["Search"][i]["imdbID"]},

                                    React.createElement("img", {className: "sr-image", src: obj["Search"][i]["Poster"]}),
                                    React.createElement("h1", {className: "sr-title"}, obj["Search"][i]["Title"]),
                                    React.createElement("p", {className: "sr-release"}, obj["Search"][i]["Year"]),
                                    React.createElement("button", {className: "expand", onClick: ()=>this.details(obj["Search"][i]["imdbID"])}, "Details"),
                                    React.createElement("button", {className: "nominate "+buttonClass[0], onClick: ()=>this.nominSave(obj["Search"][i], n)}, buttonClass[1]));

            results.push(resultItem);
        }
        results.push(React.createElement("div", {class: "button-area"}, buttons));
        ReactDOM.render(results, document.getElementById("search-results"));
    }


    //Create an overlay with the details of the movie. Also toggle the visibility of the same, closing if already open.

    details(id){
        if(id=="close"){
            this.setState({
                infoWindow: "hide"
            });
            return;
        }
        this.setState({
            infoWindow: "show"
        });

        let url="http://www.omdbapi.com/?i="+id+"&plot=full&apikey=62a2f146";

        let file=new XMLHttpRequest();
        file.open("GET", url, false);
        file.send(null);
        console.log(JSON.parse(file.responseText));

        let obj=JSON.parse(file.responseText);

        let movieCard=React.createElement("div",{id: "movie-card"},

                                React.createElement("h1", {className: "title"}, obj["Title"]),

                                React.createElement("div", {className: "sub-heading"},
                                    React.createElement("p", {className: "rating"}, obj["Rated"]+" |"),
                                    React.createElement("p", {className: "genre"}, obj["Genre"]+" |"),
                                    React.createElement("p", {className: "runtime"}, obj["Runtime"])
                                ),

                                React.createElement("img", {className: "image", src: obj["Poster"]}),

                                React.createElement("div", {className: "movie-data"},
                                    React.createElement("p", {className: "plot"}, obj["Plot"]),
                                    React.createElement("p", {className: "director"}, React.createElement("strong",{},"Director: "), obj["Director"]),
                                    React.createElement("p", {className: "writer"}, React.createElement("strong",{},"Writers: "), obj["Writer"]),
                                    React.createElement("p", {className: "cast"}, React.createElement("strong",{},"Actors: "), obj["Actors"]),
                                    React.createElement("p", {className: "release"}, React.createElement("strong",{},"Release Date: "), obj["Released"]),
                                    React.createElement("p", {className: "country"}, React.createElement("strong",{},"Country: "), obj["Country"]),
                                    React.createElement("p", {className: "languages"}, React.createElement("strong",{},"Languages: "), obj["Language"]),
                                    React.createElement("strong", {className: "rating-head"}, "Ratings: "),
                                    React.createElement("p", {className: "rating"}, "IMDb: "+obj["imdbRating"] +" |"),
                                    React.createElement("p", {className: "rating"}, "Metacritic: "+obj["Metascore"]),
                                    React.createElement("p", {className: "awards"}, React.createElement("strong",{},"Awards: "), obj["Awards"]),
                                    React.createElement("p", {className: "box-office"}, React.createElement("strong",{},"Box Office: "), obj["BoxOffice"])
                                )
                            );

            ReactDOM.render([movieCard, React.createElement("button", {className: "close", onClick: ()=>this.details("close")}, React.createElement("i", {className: "fa fa-window-close fa-2x"}, ""))], document.getElementById("movie-details"));
    }


    //Save the IMDb ID of a nominated movie to the local storage, and call a delete function if it already exists. Alter the classes of the clicked button and other nominate buttons accordingly.

    nominSave(data, n){
        let list=null;
        let clicked=document.getElementById(data["imdbID"]).getElementsByClassName("nominate");
        if(localStorage.getItem("movieList")){
            list=localStorage.getItem("movieList").split(",");
            if(list.includes(data["imdbID"])){
                this.nominDelete(data["imdbID"])
                return;
            }
            else if(list.length<4){
                list.push(data["imdbID"]);
                clicked[0].innerHTML="Remove from Nominations";
                clicked[0].className="nominate added"
                console.log("triggered");
            }
            else if(list.length==4){
                list.push(data["imdbID"]);
                clicked[0].innerHTML="Remove from Nominations";
                clicked[0].className="nominate added"
                let buttons=document.getElementsByClassName("nominate");
                for(let i=0; i<buttons.length; i++){
                    if(buttons[i].innerHTML=="Add to Nominations"){
                        buttons[i].innerHTML="Nominations Full X";
                        buttons[i].className="nominate full"
                    }
                }
            }
            else{
                clicked[0].innerHTML="Nominations Full";
                return;
            }
        }
        else{
            list=[data["imdbID"]];
            clicked[0].innerHTML="Remove from Nominations";
            clicked[0].className="nominate added";
        }
        localStorage.setItem("movieList", list);
        console.log(localStorage.getItem("movieList").split(","));
        this.setState({
            nomins: {
                        poster: [...this.state.nomins.poster, (data["Poster"])],
                        title: [...this.state.nomins.title, (data["Title"])],
                        year: [...this.state.nomins.year, (data["Year"])]
                    }
        },()=>{this.getData(n)});
    }


    //Remove given data from the local storage, and accordingly from the state. Alter the classes of nominate buttons accordingly

    nominDelete(item){
        let list=localStorage.getItem("movieList").split(",");
        let index=list.indexOf(item);
        list.splice(index,1);
        localStorage.setItem("movieList", list);

        if(document.getElementById(item)){
            let clicked=document.getElementById(item).getElementsByClassName("nominate");
            clicked[0].innerHTML="Add to Nominations";
            clicked[0].className="nominate add"
        }

        let poster=this.state.nomins.poster, title=this.state.nomins.title, year=this.state.nomins.year;
        console.log(title);
        poster.splice(index,1);
        title.splice(index,1);
        console.log(title);
        year.splice(index,1);

        this.setState({
            nomins: {
                        poster: poster,
                        title: title,
                        year: year
                    }
        });

        let buttons=document.getElementsByClassName("nominate");
        for(let i=0; i<buttons.length; i++){
            if(buttons[i].innerHTML=="Nominations Full"){
                buttons[i].innerHTML="Add to Nominations";
                buttons[i].className="nominate add";
                console.log("testing");
            }
        }
    }

    render(){


        //Items in the nominations list sidebar

        let nominList=this.state.nomins.title.map((x,i)=>(
                                                            <div class="nomin" id={i+1}>
                                                                <img class="nl-poster" src={this.state.nomins.poster[i]}></img>
                                                                <h3 class="nl-title">{x}</h3>

                                                                <button class="delete" onClick={()=>this.nominDelete(localStorage.getItem("movieList").split(",")[i])}>Remove</button>
                                                                <button class="nl-expand" onClick={()=>this.details(localStorage.getItem("movieList").split(",")[i])}>Details</button>
                                                            </div>
                                                        ));

        return(
            <div id="main">
                <section id="search-area">
                    <input id="search-bar" value={this.state.search} onChange={this.updateSearch} />
                    <button id="search-button" onClick={()=>this.getData(1)}>Search</button>
                    <div id="search-results" />
                    <div id="movie-details" class={this.state.infoWindow} />
                </section>
                <section id="nomin-area">
                    <h2>My Nominations</h2>
                    {nominList}
                </section>
            </div>
        );
    }
}

ReactDOM.render(<Main />, domContainer)

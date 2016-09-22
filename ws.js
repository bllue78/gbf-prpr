var fs      = require('fs');
var Twitter = require('twitter');
 
var client  = new Twitter({
  consumer_key        : process.env.TWITTER_CK  ,
  consumer_secret     : process.env.TWITTER_CS  ,
  access_token_key    : process.env.TWITTER_ATK ,
  access_token_secret : process.env.TWITTER_ATS
});

console.log( process.env.TWITTER_CK ) ;

var WebSocketServer = require('websocket').server ;
var http            = require('https') ;

var processRequest = function( req , res ) {
        res.writeHead(200) ;
        res.end("O_o?!");
};

var server = http.createServer({
            key  : fs.readFileSync( process.env.PRPR_KEY ) ,
            cert : fs.readFileSync( process.env.PRPR_CER )

} , processRequest ).listen( 8443 ) ;

wsServer = new WebSocketServer({
    httpServer            : server ,
    autoAcceptConnections : false
});

wsServer.getDate = function() {
    var mm = new Date().getMonth() + 1 ;
    var dd = new Date().getDate() ;

    mm = mm < 10 ? "0" + mm : mm.toString() ;
    dd = dd < 10 ? "0" + dd : dd.toString() ;

    return mm + dd ;
}

wsServer.start_date = wsServer.getDate() ;

console.log("start_date: " + wsServer.start_date) ;

wsServer.twi     = client ;

wsServer.getType =  function getType(ll , na) {
    var result = 10000 ;

    if ( ll == "Lv100") {

        result = 10000 ;

        if ( na == "ティアマト・マグナ" )       { result = 10001 ; }
        if ( na == "ティアマト・マグナ＝エア")  { result = 10001 ; }
        if ( na == "コロッサス・マグナ" )       { result = 10002 ; }
        if ( na == "リヴァイアサン・マグナ" )   { result = 10003 ; }
        if ( na == "ユグドラシル・マグナ" )     { result = 10004 ; }
        if ( na == "シュヴァリエ・マグナ" )     { result = 10005 ; }
        if ( na == "セレスト・マグナ" )         { result = 10006 ; }
        
        if ( na == "フラム＝グラス" )          { result = 10010 ; } // 10007
        if ( na == "マキュラ・マリウス" )      { result = 10010 ; } // 10008
        if ( na == "メドゥーサ" )              { result = 10010 ; } // 10009
        if ( na == "ナタク" )                  { result = 10010 ; } // 10010
        if ( na == "アポロン" )                { result = 10010 ; } // 10011
        if ( na == "Dエンジェル・オリヴィエ" ) { result = 10010 ; } // 10012

        if ( na == "グラニ" )                  { result = 10020 ; }
        if ( na == "オーディン" )              { result = 10020 ; }
        if ( na == "リッチ" )                  { result = 10020 ; }
        if ( na == "アテナ" )                  { result = 10020 ; }
        if ( na == "バアル" )                  { result = 10020 ; }
        if ( na == "ガルーダ" )                { result = 10020 ; }
    }
 
    if ( ll == "Lv120") {

        result = 10000 ;

        if ( na == "フラム＝グラス" )          { result = 12020 ; }
        if ( na == "マキュラ・マリウス" )      { result = 12020 ; }
        if ( na == "メドゥーサ" )              { result = 12020 ; }
        if ( na == "ナタク" )                  { result = 12020 ; }
        if ( na == "アポロン" )                { result = 12020 ; }
        if ( na == "Dエンジェル・オリヴィエ" ) { result = 12020 ; }
    }

    if ( ll == "Lv20" || ll == "Lv30" || ll == "Lv40" || ll == "Lv50" || ll == "Lv60" || ll == "Lv70" || ll == "Lv75" ) { // != 100 && != 120 ?

        result = 999 ;

        if ( na == "ティアマト・マグナ" )      { result = 1 ; }
        if ( na == "コロッサス・マグナ" )      { result = 2 ; }
        if ( na == "リヴァイアサン・マグナ" )  { result = 3 ; }
        if ( na == "ユグドラシル・マグナ" )    { result = 4 ; }
        if ( na == "シュヴァリエ・マグナ" )    { result = 5 ; }
        if ( na == "セレスト・マグナ" )        { result = 6 ; }
    }

    if ( ll == "Lv150" ) { result = 10000 ; }
    
    return result ;
}

wsServer.connList       = [] ;
wsServer.codeList       = [] ;
//wsServer.userList       = {} ;
wsServer.tcList         = [] ;

//wsServer.dcodeList      = [] ;

//wsServer.typecounts     = {} ;

wsServer.byRequestCount = 0 ;
wsServer.byStreamCount  = 0 ;

wsServer.getOutput = function () {
	var output    = {} ;
	var outputStr = "" ;
	
	output.prpr = this.codeList ;
	output.info = { "connections" : this.connList.length  ,
                    "lut"         : new Date().toString() , 
                    "rc"          : this.byRequestCount   ,
                    "sc"          : this.byStreamCount    /*,
                    "typecounts"  : this.typecounts*/
                  } ;
	
	outputStr = JSON.stringify(output) ;
	
	return outputStr ;
}

wsServer.doWall = function () {
	var output = this.getOutput() ;
	
	this.connList.forEach(function(element , index , list) {
		if( element.connected ) { element.sendUTF(output) ; } 
	})
	
	this.doClearCodeList() ;

    /*var ustr = JSON.stringify(this.userList) ;

    fs.writeFile("/usr/share/nginx/html/ws/userlist-" + wsServer.start_date + ".json" , ustr , function(err) {
            if(err) {
                return console.log(err);
            }
    }) ;*/
}

wsServer.doClearCodeList = function () {
	this.codeList   = [] ;
    //this.typecounts = {} ;
}

wsServer.doAddCodeList = function ( val ) {
	this.codeList.push ( val ) ;
}

wsServer.isInCodeList = function ( code ) {
    this.codeList.forEach( function(element) {
        if( element.code == code ) {
            return true ;
        }
    }) ;
    return false ;
}

wsServer.doParseTime = function ( val ) {
    return (val.getHours()   < 10 ? "0" + val.getHours()   : val.getHours()   ) + ":" +
           (val.getMinutes() < 10 ? "0" + val.getMinutes() : val.getMinutes() ) + ":" +
           (val.getSeconds() < 10 ? "0" + val.getSeconds() : val.getSeconds() ) ;
}

wsServer.doParseTweet = function ( tweet , typeby ) {
    try {
        var content = tweet.text ; 
        var c1      = content.split("参戦ID：")[1] ; 

        if ( c1 == null || c1.length <= 0 ) { return } ;

        var c2      = c1.split("\n")[1] ; 
        var code    = c1.split("\n")[0] ; 
        var info    = c2.split(" ") ;
        var level   = info[0] ; 
        var name    = info[1] ; 
        var time    = new Date(tweet.created_at) ;
        var ftime   = this.doParseTime(time) ; 
        var sname   = tweet.user.screen_name ;
        var sid     = tweet.user.id_str ;
        var type    = this.getType(level , name) ;
                    
        var obj     = { "kind"  : type  , 
                        "lv"    : level , 
                        "code"  : code  , 
                        "name"  : name  , 
                        "sname" : sname ,
                        "ftime" : ftime , 
                        "by"    : typeby 
                       } ;

        if ( code == null || code == "" ) { return ; }
        if ( name == null || name == "" ) { return ; }
        
        var isAdd   = this.tcList.indexOf( code ) ;

        /*if ( this.userList[sid] == null ) {
             this.userList[sid] = 1 ;
        } else {
            if ( isAdd == -1) {
                this.userList[sid] = this.userList[sid] + 1 ;
            }
        }*/

        if ( this.tcList.length >= 1000 ) { this.tcList = [] ; }
        this.tcList.push( code ) ;
    
        if ( !this.isInCodeList() ) { this.doAddCodeList(obj) ; }

        if ( isAdd == -1 ) {  
            //this.dcodeList.push ( obj ) ;

            /*if ( this.typecounts[type] == null ) {
                this.typecounts[type] = 1 ;
            } else {
                this.typecounts[type] ++ ;
            }*/

            if ( typeby == "request" ) {
                wsServer.byRequestCount ++ ;
            } else {
                wsServer.byStreamCount ++ ;
            }
        }
    }
    catch(e) {
        console.log("===========") ;
        console.log(tweet.text) ;
        console.log("c1=" + c1) ;
        console.log("c2=" + c2) ;
        console.log(e) ;
        console.log("===========") ;
    }
}

function originIsAllowed( origin ) {
  return true ;
}

wsServer.on('request' , function( request ) {
    if ( !originIsAllowed( request.origin ) ) {
      request.reject() ;
      console.log( (new Date() ) + ' Connection from origin ' + request.origin + ' rejected.' ) ;
      return ;
    }

    var connection = request.accept( 'echo-protocol' , request.origin ) ;
    
    connection.cKey = request.key ;   
    this.connList.push( connection ) ;
    
    console.log( (new Date() ) + ' Connection accepted. key: ' + request.key ) ;
    console.log( (new Date() ) + ' online-count: '             + this.connList.length ) ;
    
    var outputStr = this.getOutput() ;
	
    connection.sendUTF( outputStr ) ;
    
    /*connection.on('message' , function( message ) {
        if ( message.type === 'utf8' ) {
        }
    });*/
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.') ;
        console.log((new Date()) + ' online-count: '                   + wsServer.connList.length) ;
    });
});

setInterval(function(target) { 
	var outputStr = target.getOutput() ;
	
	target.connList.forEach(function(element , index , list) {
		if( !element.connected ) { console.log("clear connection: " + element.remoteAddress) ; list.splice(index , 1) ; }
		if(  element.connected ) { element.sendUTF(outputStr) ; } 
	})

    target.twi.get("search/tweets" , {"q" : "参戦ID" , "count" : 80} , function(error, tweets, response){

        var counter = [] ;

        if ( tweets != null && tweets.statuses != null ) {
            tweets.statuses.forEach(function(item){
                target.doParseTweet(item , "request") ;
            })
        }
    })

    target.doWall() ;

    var now_date = target.getDate() ;

    if( target.start_date != now_date ) {
        //console.log( "[INFO] date-change! reset and update start_date! :: " +  target.start_date + " vs " + now_date) ;
        //target.userList   = {} ;

        target.byRequestCount = 0 ;
        target.byStreamCount  = 0 ;

        //var dcodestr = JSON.stringify(target.dcodeList) ;

        /*fs.writeFile("/usr/share/nginx/html/ws/codelist-" + wsServer.start_date + ".json" , dcodestr , function(err) {
            if(err) {
                return console.log(err);
            }
        }) ;*/

        target.start_date = now_date ;
    } 


} , 5000 , wsServer) ;

var userids = "100164720,1004149160,1005514777,1006559454,1008707444,1012600554,1017542779,101940480,1024125332,1024478719,1024479194,102566854,1026531427,1026907784,102818012,102897833,1030060046,1033948716,1035010772,1040705905,1043403506,104413753,1045381453,1046752656,104870217,1050243229,1050819228,105089375,1053081596,1057313862,1062151076,1066198154,1066437732,107055615,1071196586,107329844,107340450,107421686,1076651090,1077168368,107744918,1078259036,1079217283,108032600,108552253,1086160220,109265121,109285918,109300352,1096909784,1097141300,1105309416,110531515,1106271408,110731522,1108621542,1108739828,1110482312,1113565309,1114090003,1127460181,113021013,113385649,1134684438,1135544952,114147744,1141879141,1144680806,1145259644,114768068,1153806750,115608777,1157372929,1157502890,115930902,1159897783,116352148,116644889,116723120,116761671,1167795096,116952397,1170403310,1171565918,117414915,118088959,118140874,118589378,1191845089,119369852,119396918,1195579628,119591633,119695603,120341366,120396083,121367502,1214075467,1214328342,1217122279,121980397,1220474179,1221675438,1223375130,1224056504,122413240,122768270,122901497,1229216070,1234126866,123537387,123543619,123545178,123567629,1238865823,1241426798,1242391795,1243357465,124716767,124800505,1253156593,1253373926,1257422413,126531628,1272331188,127540553,127904619,128247956,1282707278,1282855238,128479196,128706217,1288061203,128900440,1290029562,129209401,129211678,1292305207,1293989388,129452576,1294682204,1306671012,1308980665,131393419,1317765223,132019133,132119348,1322769168,1323926276,1326600048,1326617701,132913360,132936057,1329552488,1330980168,1336895821,1338331706,1338743383,1339342620,133953621,134056781,1343895301,1351045062,1351995966,1353190604,135429499,135873074,136271876,1364994577,1366348213,1369675350,1369903489,137356895,137669901,137728371,137953758,1382849640,138375988,1384448342,138738729,138783496,1392381349,139264284,140220751,1402597795,1404961513,1405144980,1407092557,1409967421,1411072232,141309096,1413519361,1414692115,141552698,1417047577,1418360047,1421244445,1423528842,142438810,1425125840,1426203205,1428039145,1428046284,1429114356,142927814,1432861058,1433650267,1433873125,1434725365,1436200213,1437606884,1437683281,143819781,1438569985,144440488,1445569357,144572414,1445834623,1446759972,1448950364,1454525574,1455040621,1460098459,146123875,1461928692,146370851,146431983,146518953,1467415832,146845431,1469404813,1469538613,14712244,1471569170,1473359612,1473651086,1473733574,1473930630,1474237272,1474257332,1476917252,1479661927,1481040390,148343194,1484417774,1487723179,1488464190,1492053127,14954810,149786019,149927548,1503758557,1510263330,1510301634,151088651,1511345514,151134773,151380960,1519524414,1522160509,152348248,1524884310,1527547789,153051867,153322422,153898947,1539740426,1540566042,1540790276,1542344810,154338459,154365730,154467389,1546014338,154657678,1546692248,154674708,1547626717,154875734,1549334202,154998126,155152551,155520753,1556208824,1556856366,1557889861,155952001,1559727506,1563085381,1565426395,1565934277,156646769,1567559826,1568389212,1568445493,1568712188,156924698,1571883138,1582674506,1582912616,1583370169,158635309,1586460824,158774595,1588721318,159007016,159541843,1596902252,1601311183,160162457,160607348,16065875,1608146706,1608547184,1615167398,1615797888,1617100314,1617717847,1617983473,1620835362,1622065046,1622571385,162588053,162771612,162919069,163029953,1633607623,1634674260,1635650760,163607290,163723737,1640851440,1642945632,1644975608,1645140978,1647814352,164969056,16555492,165994413,1660765057,1661918971,1664363900,1664420462,166629799,166821874,167306297,1675964808,1676480916,1676865248,168456874,168520588,168536968,1685453682,1691982678,1694484188,1696298186,1698110156,1698214400,1698986706,1699867866,1701526908,170268033,17074844,1713403711,1714526940,1714595822,1715113675,1715416868,1716152131,1716347934,1717349336,171760107,171762073,1718992142,1724894018,172676955,1727853398,173010765,1731400848,1735158986,1739019234,175590732,175748128,177445609,177458882,177509416,177510504,177970610,178139818,178280793,178783372,178946313,179109280,179878353,1804945626,180697899,180741993,1827657938,1828886503,184077374,1841144924,1847475619,1850186298,1854680240,185585796,1856592594,1856678102,186292378,1863295088,186420291,186736452,186835002,1870645626,1870945472,1871014687,187258389,1872598410,1873310215,187801105,188146445,188363029,188651847,1889183989,189033556,189091527,189199675,1896294889,190619776,190976514,1914243020,1914888470,191741082,191778450,1922743910,192625974,192671006,192898265,1931263705,1934775764,194218324,1942865192,1943305010,1943470382,1946369616,1946556288,1953302185,1953398240,19539564,1954869187,195624519,195697625,1956994212,1962073735,1962679074,1963685407,1967079108,1968420572,1969083656,1971965670,1973128741,1973675136,1975510237,197643238,1977975330,1978060267,199212627,200664571,200711298,201857950,203716785,205750119,206940515,206958467,207100440,210806955,210832543,211446255,212272075,212296863,213266448,213282537,213617253,213942078,214948021,2149742558,2150823656,2152435910,215266043,2153047404,2153193968,215427756,2154576530,215666491,215857215,2158778210,2159014040,2160211902,2160228504,2160461545,2163127908,2164183530,2165930784,2167655970,2168472703,2170728560,2172545768,2173841594,2177624834,2181425630,2181760152,2181809756,2182517773,218397937,2183980424,218552551,2185825758,2186446434,2187314179,218779751,218812661,2193565226,2193583842,2195229428,2197186938,2200425492,2202956563,2204592097,2206116121,2207263418,2207916548,2210450826,221058959,2212189968,2215303454,2217582145,2217968107,2223011010,2225737352,2226624614,2230968434,2231397632,223150603,2232699450,2233778971,223380818,2236158540,2236423682,2239027166,2239432320,2239866542,2240196535,2240501204,2242724761,2243219496,2247168782,2247240924,2247986353,2248521517,2249104273,224991814,225031079,2250328202,2250380168,22507541,2252241667,2252882580,2252949060,2253818438,2254785704,2255400408,2256570908,2256765631,2257619846,2257670005,2259161077,2260062380,226065426,2262333330,22632506,2264557880,226508361,2266086230,2268324104,2268695172,226873708,2269718660,2270330684,2270901360,2272701128,2272959810,2273860093,2276131488,2276221346,227819568,227953011,2279847834,228023996,228028886,228034573,2281547642,2281628262,2282233710,2282469422,2282509056,228288887,2283275016,2283553838,2283577585,2285280768,2287329211,2288049282,2290477291,2290865718,2290888412,2291873984,2292652243,2294462503,2294601636,2297714144,2299235466,2299555057,2301059576,2301090163,2304619933,230765745,2308212620,2310472027,2311569512,2313711798,2314725547,2314778550,2315051521,2315158053,2315162990,2315409349,2315603924,2316569778,2317915148,2318909306,2318945108,2321917662,2322251982,2323883035,2323930975,232555596,2327312509,2329888302,2331111355,2331462271,233500653,2335039350,2337742740,2339750994,2342228107,2343439244,2343591770,234373498,2348054197,2349374078,2350369459,2350821955,2351524862,2352128916,2354346674,2355813174,2356355347,2356769954,2357341279,2357951221,236024167,2362299883,236250275,2363385218,236459285,2368783987,2370219570,237190172,2373919694,2374642968,2378429198,2379935478,2380813308,2382284215,2383513058,2384150358,2388781538,2388976495,2390426358,2390430452,2392218560,2393342598,2393828672,2394054271,2394418142,2394760866,2397345841,2399941830,2401776163,2404956288,2406507146,240737257,2408228570,2410858268,2412424345,2413620884,2414192701,2417415409,2418122046,2418630985,241961481,2420283282,2421473227,2421509497,2422079468,2422799755,2423348168,2424668203,2425084230,2426627616,242703309,2427809762,242869428,2428978110,2429092956,2430797546,2433716941,2434660783,2435958404,2438327466,243991518,2440575697,2441186438,2441618562,2441801288,244516263,244545667,2446618430,2451333584,2451333878,2454091626,2455955473,2456683550,2461060574,246128237,2465428856,2465474029,2468252485,2469254562,2470871030,2472010850,2473542204,2473815181,2474234641,2479245960,248016815,2481234102,2483285870,2484815449,2486725707,2487749862,2494140090,2496689359,2498337674,2499032887,2499459157,249950622,250591263,250695500,2507110141,2507579640,251025812,251030783,2511770732,2515349426,2515705009,2516915208,2517840589,2520508962,2520748680,2523649754,2524055810,2524659169,2527310076,2528028674,2537509368,2538172789,2539180723,2544947858,2546237211,2546293710,254732313,254862580,2549756994,254998058,2550467629,2550787080,255096791,2553800706,2555964739,2560671529,2562002370,2568269304,2568937076,2570206158,2570306087,2571289460,2571933156,2572411490,2575099412,2575677145,2576761087,2577936062,2580235148,2582166175,2583731384,2586133788,2587143349,2587223144,2587565466,2590939554,2591897052,2592073015,2593944805,259641713,2597562055,2598282974,2601405636,2603484498,2605458722,260551284,2605523588,2605617008,2607048530,2608845013,260916958,260973455,2614668972,2617071985,2617151772,262556826,263126782,2631304064,263933734,264122806,2644522608,2646946938,2647024392,264723677,264785148,2649803761,2652916296,2652948962,2656043682,2657375636,265765342,266030637,2662051908,266628643,2669086477,2669535432,2670069140,267014993,2670858019,2673145778,2673414085,2673675260,2676116580,2676128323,268100472,2688950162,2692057231,2692961672,2693122850,2693408408,2693759582,269454522,269611930,2696402630,26973029,269747996,2697815449,2698170222,2698253688,2703740430,2703780950,270393921,2704328826,270479554,2707988900,2708893964,2710117346,2711146393,2711511494,2711549112,2711941777,2713071282,2713191193,2713918670,271473712,2715735997,27163673,2716579872,2717017447,2717541930,2718905083,2719692282,2721326731,2721908870,2723658060,2725838383,2726231198,2727913230,2728568918,272884353,2729064607,272996072,2730580900,2731104582,2731198154,2731489999,2731726891,2737200273,2737339261,273822255,2740050846,2746177656,2748098121,2752238347,2752357945,275994398,276015051,2760689304,2760940836,2763119784,2765314098,2770090868,2770138083,2770552994,2772210816,2772463387,2772748656,2772802812,277322186,277482059,2777809165,2778619284,277881838,2780410363,2780484752,2780566447,2780765940,2781692124,2783662801,2785454742,2785697144,2785796346,2788682714,2789101399,2789635560,2790935426,279098916,2791843908,2791858116,2793580250,2794386698,2795271662,2795465309,2795861940,2796043729,2797585243,2797754222,2798152650,2798887412,2799248491,2800294297,2801031145,2801144088,2802219931,2805155306,2805334916,2805493123,2805603702,2805658088,2806874868,2808020647,2808752216,280936831,2811154344,2811717864,2812711680,2813848993,2813859547,2814025285,2814771852,2816679806,2816950772,2819242164,2820198620,2821253414,2825591438,2828366621,2831066418,2831131874,2831288708,2833541576,2833614644,2834998974,2836516981,2836619666,2837788746,2838857034,2839136383,2839481281,2839914602,2841011706,2841044894,2841114716,2841656918,2842766724,2843536056,2843948642,2848051339,2848190510,2849631271,2849939364,2850540136,2851623036,2854045902,2854336710,285547855,2855556523,2859316758,2859527358,2859712550,2861922199,2861949511,2862768234,2865311312,2867866506,2868486781,2868662718,2868833478,2874978409,2875954651,2876582335,2876790278,2878419475,2878850078,2880408151,2880669368,2881601718,2881625677,2881661797,2882105772,2883017940,2883074228,2883205266,2884478750,2885061583,2885276862,2886830724,2887617085,2888373072,2889675642,2889775554,2892507715,2892986438,2893748172,2893783968,2895567877,2895649904,2896318656,2897400660,2897499612,2897725237,2898055224,2898127483,2898615277,2898780144,2900870094,2901261518,2901675997,2903342198,2903478318,2903538276,2903643211,2903807672,2904228950,2904296317,2904811716,2904889770,2906170706,2907304406,2907481820,2907801067,2908250090,2908908318,2909694205,2910845534,2911512434,2911744896,2911939212,2911945879,2912275212,2912376518,2912412054,2912432617,2912665872,2912687119,2912884099,2912902621,2913003751,2913808159,2914396886,2914618470,2914631485,2914639927,2915497020,2915617700,2915628798,2915892488,2916049388,2916171600,2916819433,2917352112,2917512770,2918348874,2918741372,2918943398,2919347899,2920122900,2920259563,2921600917,2922081944,2923613317,2923976797,2924277216,2925567224,2926912160,2927609786,2928210422,2928845197,2929019636,2929554486,2930848939,2931310670,2933058740,293396661,293431215,2935380558,2935608301,2939156172,2939224513,2939476974,2939772974,2940466956,2941473864,2941824727,2942243389,2942512304,2942868858,2943185617,2944549855,2953013606,2953452378,2955538063,2955738739,2955977539,2958584047,2958694814,2958711960,2959317824,2962326936,2962904720,2963239425,296438122,2969177467,2969547439,2969625102,2975105078,2976302748,2976755802,2978678611,2978880930,2981911442,2982118572,2983079605,2984716117,2985610994,2986439755,2986722727,2988890496,2989658060,2990076824,2991647449,2992361751,2992378584,2994723487,2996017416,2996453978,2998835677,2999348162,2999597713,3003543607,3003624806,3006300050,3006338191,3007911745,3009329702,3009690385,3009757885,3009997870,3010315740,3010695235,3011262392,3011912438,301237592,3012643796,3013104541,3014302946,3014347208,3016115419,3017078644,3017683785,3018541194,3019047217,3020114395,3020372298,3021425816,3022807606,3024220254,3025605085,302777283,3032154409,3032272866,3032379835,3033786494,3035147958,3038367708,3038523180,3038534100,303861471,3038912822,3038933311,3039374161,3039506246,3039718764,3040033604,3040822770,3041301510,3041412763,3041524639,304309667,3044895738,3045392750,3047473885,3049415060,3049650511,3049692492,3049752966,3049850401,3050001420,3050026322,3050078407,3050079751,3050138516,3050156024,3050221400,3050294000,3050357598,3050405474,3050446086,3050514344,3050625138,3050655254,3050797987,3050843287,3050910193,3051733838,3052084033,3052197991,3052359566,3052569096,3052791596,3052849639,3053293946,3054183836,3054436128,3054519234,3054682471,305547033,3056311002,3056546390,3058789150,3059228034,3059652001,306210707,3062369814,3062642491,3062796306,3063232687,3063325157,3063748099,3065363246,3066236766,3066662899,3068945006,3069651026,3069690061,3069944586,3070546274,3071110267,3072926180,3073335355,3073388304,3075256699,3076866193,3077474172,3080815148,308797774,3088507364,3089442786,308966353,3089779352,3092708322,3095982740,3096122041,3098267220,3098442420,3099667490,310082528,310106195,3101657767,3101657785,310290817,3103347150,3104559806,3106685408,3106816896,3106833428,310794265,3108393738,310973719,3110838478,3112259376,3112460194,3112870159,311307267,3116031086,3116336208,3116789390,3117097082,3118412295,3118545099,3120906415,3120937188,3122621940,3122632274,3123434912,3128855466,3130197985,3131994008,3132579325,3137173508,3138285750,3138412014,3139517222,3143110386,3144570984,3144841193,3149321378,3149443412,3149548334,3151299198,3152660426,3153240374,3157309884,3158516958,3160634623,3161155058,3161437362,3161635273,3161751673,3161885370,3162032569,3164741952,3166115325,3167000938,3167393870,3167531125,3167572512,3167602494,3168386000,3171141540,3171501470,3177191971,3177626305,3178250574,3179402192,3179431442,3182700876,3184143200,3184314685,3184559017,3184654184,3184788727,3185443394,3185747534,3186214566,3186304921,3186991411,3187957711,3187959968,3188367031,3190287433,3191521421,3191985188,3193364896,3193680451,3193993284,3194811973,3196064412,319688731,319732319,3197468629,3197887975,3198273128,3203506472,320897310,3213247596,3214483467,3218980602,3220439072,3220443962,3220549428,3220631780,3221959801,3222739775,3223466730,3223544451,3223669094,3224948870,3224951437,3225513288,3226204903,3227336508,3227698758,3228099643,3228159758,3228176875,3228182137,3229605750,3229790431,3230615425,3231321252,3231773311,3232696392,3232931377,3233270437,3233403350,3235901762,3236277297,3236358454,3236975916,3236996959,3237028830,3237724296,3238063699,3238490989,3238496964,3238577323,3240300222,3240825806,3242021510,3242275410,3242794027,3243174642,3243581971,3243866046,3243933750,3245007782,3245657438,3245910828,3246526296,3247497793,3248389806,3248863370,3249401468,3249901747,3251175066,3251819408,3253676648,3253699273,325411278,3254115720,3254441754,3255452442,3255624343,3256709472,3256806422,3256870021,3258017005,3258488886,3258514818,3259253131,3259764108,3261180078,3261363678,3261939547,3264022435,3269278904,3269801436,3269962404,3270047244,3270120409,3270283560,3271003856,3271819807,3272417526,3272749176,3274791763,3275460842,3277610971,3278100224,3278366527,3278443435,3278745487,3278757122,3279194454,3279891590,3280607155,328069026,3280966723,3281115524,3281719518,3281882755,3282292190,3282493052,3282530065,3283128678,3284296645,328520426,3285772706,328606210,3286716654,3286764901,3287051060,3287573461,3288247482,3288735764,3288888972,3290426900,3291766974,3293079283,3294059906,3295576459,3297689940,3299440706,3299468378,3299689328,3300425845,3300533467,3301122377,3303062030,3303125906,3303163694,3303230952,3303742987,3304180152,330422123,3304429904,3304902732,3304968462,3307299373,3307873327,3308570153,3308859482,3308984256,3309258391,3311419754,3312329354,3314107411,3314169445,3317057221,331719389,3318053474,331980588,3320146548,3320974698,3321000372,3321090536,3321921170,332198096,3322610054,3323911494,3324395724,3324449185,332604305,3326494950,3326803638,3327224591,3327973580,3328197224,3335843720,3344400734,334702527,337050655,3381803713,3385280064,3387428060,338885806,3389125344,338963845,3390177735,3399889754,340017287,340105758,340276535,3405309739,341337747,341976790,3422231072,3424893374,3428446339,3428522113,343308979,343737925,3440320334,344072247,344586522,344783346,344799114,3448253832,3450635354,346069393,34613030,3464905573,3467363600,3468604218,3481339998,348228842,3483208525,3483848172,3486219014,3501482058,3504872414,3506427680,3515660842,351641012,351892213,3525468806,3530647874,3537847818,354340470,3544633513,354591974,3547196190,3549309913,355468384,3554694254,3557799734,3565722554,3572553979,357263379,3582082220,359093396,359354698,3594598632,3605982012,3618484394,3618885372,3626463372,362832358,3639517694,3643493474,3646950985,3648378318,365519932,3655836741,365849726,3660262040,3663528372,3665440160,3666321801,3668116093,3670365312,3670957224,3671979853,3672107053,3672130518,367806295,368782857,3703003519,370574103,370960434,371096273,371594737,3722068939,373842704,3739021398,3745717933,374948325,3756845653,3757435694,376089087,377179779,3772347924,3773329880,3776175193,3776288778,3776769019,3778070294,3779672292,378124670,378423277,3784247906,3788860212,379639825,3801563419,3805923912,3808844174,3812474953,3819672074,3820727234,382475899,3825853100,383183105,384246525,3845597593,385455574,385547772,385767908,3859863254,3862869132,386495215,3868255394,3869652133,3870160039,3870457534,3870657554,3872543233,3878661612,3880125978,3893874972,3902848753,390392791,390419756,390666789,390901443,3912559873,391299959,3914975065,3915711612,391722224,3925994713,3926933173,39273298,3943855092,3960072192,3964165874,3966332665,3968701459,396957034,3970303458,3971677633,397355109,3979810332,3987275899,3992653334,399347670,399561572,399702627,4001417772,4005302892,400689484,4011491774,4016168474,401709741,4024215559,4025120480,4025524754,4036045813,4036409598,4041155358,4041517754,4041838993,4042084034,404274172,4043920460,4044152412,404634544,4051986854,4055709134,4057486873,4064244673,4071054558,4075465164,408626587,4088216953,4091374932,4092808092,4093251612,409343539,409774384,4097787192,4098542060,4100176274,4102064414,4103254939,4104774253,4109300414,4112203284,411278105,4112950998,4113965714,4114398799,411448467,4114969518,4124563933,4125649940,4127722513,4131796034,413207566,413245549,4134498193,414378906,4147938493,414829234,414899672,415401725,4156245865,4163372652,4165511713,4173669194,4177540514,4184973614,4186016653,4192585512,4195711572,4201661953,4202217793,420361828,4207094592,420939257" ;

//console.log("userids.len=" + userids.split(",").length) ;

var stream1 = client.stream('statuses/filter', {follow: userids});

stream1.on('data', function(event) {

    if( event                        != null && 
        event.text                   != null && 
        event.text                   != ""   && 
        event.text.length             > 0    && 
        event.text.indexOf("参戦ID") != -1 ) {
        wsServer.doParseTweet(event , "streaming") ;
    }
}) ;

const apiKey = "";
const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");

//여기부터 웹서버 구축 

const express = require('express')
var cors = require('cors')
const app = express()
const configuration = new Configuration({
    apiKey: apiKey, 
});

const openai = new OpenAIApi(configuration);


//cors이슈 해결 
//cors: 모든 요청을 허용하면 취약하기 떄문에 어디서 요청이 왔는지 확인하는 과정
//npm i cors로 설치

let corsOptions = {
    origin: 'https://fortune-tell-cat.pages.dev',
    credentials: true,
    methods: ["GET", "POST"], // 추가: 허용하려는 메서드를 지정
    allowedHeaders: ["Content-Type", "Authorization"]
}


app.use(cors(corsOptions));



// post메소드의 요청을 받아줄 body 를 먼저 선언하여야 post요청이 가능하다

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/profile', function (req, res, next) {
    console.log(req.body)
    res.json(req.body)
})



/* get 
app.get('/', function (req, res) {
  res.send('Hello World')
}) */

// POST method route
// app.post (or get)('라우팅',  콜백함수)
// app.listen('포트번호')에서 포트번호로 get/post요청이 들어오고,
// 라우팅을 붙인 요청이 들어올 시 콜백함수를 호출하라 
app.post('/fortuneTell', async function (req, res) {
    let { userMessages, assistantMessages, myDateTime} = req.body;
    let todayDateTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    console.log(userMessages);
    console.log(assistantMessages);
    let messages = [ // 기본대화값
            { role: "system", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변할 수 있습니다. " },
            { role: "user", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 챗도지입니다. 당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변할 수 있습니다. " },
            { role: "assistant", content: "안녕하세요, 챗도지입니다. 저는 매우 자신감 있는 점성술사이며, 사람들의 운명과 운세에 대해 풍부한 지식을 가지고 있습니다. 제가 도움이 될 수 있는 점이 있으시면 언제든지 물어보세요. 저는 당신의 질문을 기다리고 있겠습니다." },      
            { role: "user", content: "저의 생년월일과 태어난시간은"+ myDateTime+ "입니다. 그리고 오늘은 "+todayDateTime+"입니다" },
            { role: "assistant", content: "당신의 생년월일과 태어난시간은"+ myDateTime+ "이고, 오늘 날짜는 "+todayDateTime+"인 것을 확인하였습니다. 운세에 대해서 어떤 것이든 물어보세요! "  },
        
    ];

    while(userMessages.length!=0 || assistantMessages !=0){
        // 답변이 올 때 개행문자 등을 포함하여 지저분하게 오기 때문에
        // 정규표현식으로 없애고 받을 것
        if(userMessages.length !=0){
            messages.push( //JOSN값은 key를 항상 쌍따옴표로 감싸야함
                JSON.parse('{ "role": "user", "content": "'+ String(userMessages.shift()).replace(/\n/g,"") +'"}')
            );
        }
        
        
        if(assistantMessages.length !=0){
             messages.push(
                JSON.parse('{ "role": "assistant", "content": "'+ String(assistantMessages.shift()).replace(/\n/g,"") +'"}')
             );
        }

    }
    
    console.log(messages);
    const chatCompletion = await openai.createChatCompletion({


        model: "gpt-3.5-turbo",
        //max_tokens: 100,
        // temperature: 0.5
        messages: messages
    });
    let fortune = chatCompletion.data.choices[0].message['content'];
    //console.log(fortune);
    res.json({"assistantMessage":fortune});

    
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://your-origin.com");
  next();
});
//app.listen(3000)
// express로 만든 앱을 serverless를 통해 내보냄
module.exports.handler = serverless(app);




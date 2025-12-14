// 모델이 저장된 폴더 경로 (model.json과 metadata.json이 이 폴더 안에 있어야 함)
const URL = "mymodel/";

let model, labelContainer, maxPredictions;

const styleExamples = {
    'acubi': ['acubi-1.jpg', 'acubi-2.jpg','acubi-3.jpg','acubi-4.jpg'],
    'athleisure': ['athleisure-1.jpg', 'athleisure-2.jpg','athleisure-3.jpg','athleisure-4.jpg'],
    'blockcore': ['blockcore-1.jpg', 'blockcore-2.jpg','blockcore-3.jpg','blockcore-4.jpg'],
    'casual': ['casual-1.jpg', 'casual-2.jpg','casual-3.jpg','casual-4.jpg'],
    'chic': ['chic-1.jpg', 'chic-2.jpg','chic-3.jpg','chic-4.jpg'],
    'coquette': ['coquette-1.jpg', 'coquette-2.jpg','coquette-3.jpg','coquette-4.jpg'],
    'cottagecore': ['cottagecore-1.jpg', 'cottagecore-2.jpg','cottagecore-3.jpg','cottagecore-4.jpg'],
    'feminine': ['feminine-1.jpg', 'feminine-2.jpg','feminine-3.jpg','feminine-4.jpg'],
    'grunge': ['grunge-1.jpg', 'grunge-2.jpg','grunge-3.jpg','grunge-4.jpg'],
    'hippie': ['hippie-1.jpg', 'hippie-2.jpg','hippie-3.jpg','hippie-4.jpg'],
    'minimalist': ['minimalist-1.jpg', 'minimalist-2.jpg','minimalist-3.jpg','minimalist-4.jpg'],
    'old money': ['old-money-1.jpg', 'old-money-2.jpg','old-money-3.jpg','old-money-4.jpg'],
    'preppy': ['preppy-1.jpg', 'preppy-2.jpg','preppy-3.jpg','preppy-4.jpg'],
    'punk': ['punk-1.jpg', 'punk-2.jpg','punk-3.jpg','punk-4.jpg'],
    'streetwear': ['streetwear-1.jpg', 'streetwear-2.jpg','streetwear-3.jpg','streetwear-4.jpg'],
    'Y2K': ['y2k-1.jpg', 'y2k-2.jpg','y2k-3.jpg','y2k-4.jpg']
};

// ---------------------------
// ✅ 모델 초기화 함수
// ---------------------------
async function init() {
    // 모델 파일과 메타데이터 파일 경로 지정
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
   
    // Teachable Machine의 이미지 모델 로드
    model = await tmImage.load(modelURL, metadataURL);

    // 모델이 가진 클래스(분류 항목) 개수 가져오기
    maxPredictions = model.getTotalClasses();

    // 예측 결과를 표시할 HTML 요소 가져오기
    labelContainer = document.getElementById("result-container");
}

// ---------------------------
// ✅ 이미지 업로드 처리 함수
// ---------------------------
function handleImageUpload(event) {
    // 업로드된 파일 가져오기
    const file = event.target.files[0];
    if (!file) return;  // 파일이 없으면 종료

    const previewDiv = document.getElementById("preview");
    previewDiv.innerHTML = '<img id="uploadedImage" alt="uploaded outfit">';

    // 미리보기 이미지를 표시할 요소 선택
    const imgElement = document.getElementById("uploadedImage");

    // FileReader를 사용하여 파일을 읽기
    const reader = new FileReader();

    // 파일을 모두 읽은 후 실행되는 함수
    reader.onload = function (e) {
        // 읽은 이미지 데이터를 <img> 태그의 src 속성에 적용
        imgElement.src = e.target.result;

        // 이미지가 로드되면 모델 예측 실행
        imgElement.onload = function () {
            predict(imgElement);
        };
    };

    // 파일을 DataURL(이미지 형태)로 읽기 시작
    reader.readAsDataURL(file);
}

// ---------------------------
// ✅ 이미지 예측 함수
// ---------------------------
async function predict(imageElement) {
    //show right container
    document.getElementById("result-title").style.display = "block";

    // 모델로 이미지 예측 수행
    const prediction = await model.predict(imageElement);

    //sort based on highest prediction
    prediction.sort(function(a, b){
        return b.probability - a.probability;
    });

    //top 3
    const top3 = [prediction[0], prediction[1], prediction[2]];

    labelContainer.innerHTML = '';

    // 각 클래스별 확률을 화면에 표시
    for (let i = 0; i < 3; i++) {
        let styleName = top3[i].className;
        const originalStyleName = styleName;
        const percentage = (top3[i].probability * 100).toFixed(0);

        if(i === 0) {
            styleName += ' ⭐️';
        }
    
    //get examples
        let examples = styleExamples[originalStyleName];

        if (!examples) {
            examples = ['casual-1.jpg','casual-2.jpg'];
        }
        
        const card = document.createElement('div');
        
        if(i===0){
            card.className = 'style-card top-rank-card';
        } else{
            card.className = 'style-card';
        }

        card.innerHTML = 
     '<div class="style-info">' +
        '<div class="style-name">' + 
            '<span class="rank-badge">#' + (i+1) + '</span>' + 
            '<a href="https://www.google.com/search?tbm=isch&q=' + styleName + ' outfits" target="_blank" class="style-link">' + 
            styleName.toUpperCase() +
            '</a>' +
          '</div>' +
        '<div class="confidence">' + percentage + '% match</div>' + 
          '<div class="progress-bar">' +
           '<div class="progress-fill" style="width: ' + percentage + '%"></div>' + 
        '</div>' +
        '<div class="style-images">' +
          '<img src="' + examples[0] + '" alt="' + styleName + '" class="style-example">' +
          '<img src="' + examples[1] + '" alt="' + styleName + '" class="style-example">' +
          '<img src="' + examples[2] + '" alt="' + styleName + '" class="style-example">' +
          '<img src="' + examples[3] + '" alt="' + styleName + '" class="style-example">' +
     '</div>';

        
        labelContainer.appendChild(card);
    }
}

// ---------------------------
// ✅ 초기화 및 이벤트 등록
// ---------------------------
init();  // 페이지 로드 시 모델을 미리 불러오기

// 이미지 업로드 시 handleImageUpload 함수 실행
document.getElementById("imageInput").addEventListener("change", handleImageUpload);

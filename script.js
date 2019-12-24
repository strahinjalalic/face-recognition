const imageUpload = document.getElementById('imageUpload');

//lista biblioteka koje koristimo
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //algoritam za detekciju
]).then(start);

async function start() {
  const container = document.createElement('div');
  container.style.position = 'relative';
  document.body.append(container);

  const labeledDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.faceMatcher(LabeledFaceDescriptors, 0.6);

  let image;
  let canvas;

  document.body.append('Loaded');
  imageUpload.addEventListener('change', async() => {

    //kada ucitamo novu sliku da izbrisemo prethodne podatke
    if(image) image.remove();
    if(canvas) canvas.remove();

    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);

    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    //pronalazi najbolje poklapanje slike sa karakterima
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

    //Za svako lice da nam prikazuje isti okvir koji sadrzi parametre
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
      drawBox.draw(canvas);
    });
  });
}

function loadLabeledImages(){
  const labels = ['Dositej Obradovic', 'Ivo Andric', 'Mihajlo Pupin', 'Milutin MIlankovic', 'Nadezda Petrovic', 'Nikola Tesla', 'Vuk Stefanovic Karadzic'];
  
  return Promise.all(
    labels.map(async label => {
      const descriptions = []; 

      //petlja ide do 2 zato sto imamo za svakog karaktera po 2 slike
      // for(let i = 1; i <= 1; i++){
        const img = await faceapi.fetchImage(`./labeled_images/${label}/1.jpg`);
        const detections = await faceapi.detectSingleFace(img).widthFaceLandmarks().withFaceDescriptor();

        descriptions.push(detections.descriptor);
      // }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  );
}
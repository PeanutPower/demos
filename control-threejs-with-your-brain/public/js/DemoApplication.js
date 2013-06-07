var DemoApplication = VAPI.VeroldApp.extend({
    defaultSceneLoaded: function (scene) {
        var models = scene.getAllObjects({ 'filter': { 'model': true } }),
            lookAt,
            attention = undefined,
            meditation = undefined;

        this.xwing = scene.getObject("51af7490e62e414624000ea4");
        this.yoda  = scene.getObject("51af70a3e62e414624000d36"); 
        this.model = this.xwing;

        this.camera = new THREE.PerspectiveCamera(70, this.getAspect(), 0.1, 10000);
        this.camera.up.set(0, 1, 0);
        this.camera.position.set(-2, 0.4, 1.1);

        lookAt = new THREE.Vector3();

        if (this.model) {
          lookAt.add(this.model.threeData.center);
          lookAt.multiply(this.model.threeData.scale);
          lookAt.applyQuaternion(this.model.threeData.quaternion);
          lookAt.add(this.model.threeData.position);
        }

        this.camera.lookAt(lookAt);

        this.veroldEngine.setActiveCamera(this.camera);

        this.controls = new THREE.OrbitControls(this.camera, this.getRenderer().domElement);
        this.controls.userPanSpeed = 0.05;

        // Setup the Dashboard
        this.attentionGauge = new jGauge(); 
        this.attentionGauge.id = 'attentionGauge'; 
        this.attentionGauge.ticks.start = 0;
        this.attentionGauge.ticks.end = 100;
        this.attentionGauge.label.suffix = 'A';
        this.attentionGauge.imagePath = 'img/jgauge_face_taco.png';
        this.attentionGauge.width = 170;
        this.attentionGauge.height = 170;
        this.attentionGauge.needle.imagePath = 'img/jgauge_needle_taco.png';
        this.attentionGauge.needle.xOffset = 0;
        this.attentionGauge.needle.yOffset = 0;
        this.attentionGauge.label.yOffset = 55;
        this.attentionGauge.label.color = '#fff';
        this.attentionGauge.ticks.labelRadius = 45;
        this.attentionGauge.ticks.labelColor = '#0ce';
        this.attentionGauge.ticks.color = 'rgba(0, 0, 0, 0)';
        this.attentionGauge.range.color = 'rgba(0, 0, 0, 0)';
        this.attentionGauge.init();

        this.meditationGauge = new jGauge(); 
        this.meditationGauge.id = 'meditationGauge'; 
        this.meditationGauge.ticks.start = 0;
        this.meditationGauge.ticks.end = 100;
        this.meditationGauge.label.suffix = 'M';
        this.meditationGauge.imagePath = 'img/jgauge_face_taco.png';
        this.meditationGauge.width = 170;
        this.meditationGauge.height = 170;
        this.meditationGauge.needle.imagePath = 'img/jgauge_needle_taco.png';
        this.meditationGauge.needle.xOffset = 0;
        this.meditationGauge.needle.yOffset = 0;
        this.meditationGauge.label.yOffset = 55;
        this.meditationGauge.label.color = '#fff';
        this.meditationGauge.ticks.labelRadius = 45;
        this.meditationGauge.ticks.labelColor = '#0ce';
        this.meditationGauge.ticks.color = 'rgba(0, 0, 0, 0)';
        this.meditationGauge.range.color = 'rgba(0, 0, 0, 0)';
        this.meditationGauge.init();

        var socket = io.connect('http://localhost:3000');

        that = this;
        socket.on('think', function (data) {

            // data":{
            //   "eSense": {"attention":67,"meditation":51},
            //   "eegPower":{"delta":4936,"theta":1639,"lowAlpha":351,"highAlpha":1109,"lowBeta":679,"highBeta":657,"lowGamma":552,"highGamma":392

            if (data['data'] && data['data']['eSense']) {

                attention = data['data']['eSense']['attention'];
                meditation = data['data']['eSense']['meditation'];

                console.log("attention: " + attention + ", meditation: " + meditation);

                that.attentionGauge.setValue(attention);
                that.meditationGauge.setValue(meditation);

                if (attention > 80 && that.xwing.threeData.position.y <= 0.4) {
                    // if you meditate, you can lift it up to 0.4 off the ground
                    that.xwing.threeData.position.y += meditation * 0.005;
                }

            }

        });

    },

    update: function(delta) {
        this.controls.update();

        if (this.xwing.threeData.position.y >= -0.4) {
            // gravity
            this.xwing.threeData.position.y -= 0.001;
        }

    }

});

var app = new DemoApplication({
    el: '#verold3d',
    projectId: '51af709c1f0269020000014f',
    engineOptions: {
    }
});

app.run();

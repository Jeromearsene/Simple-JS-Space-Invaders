window.onload = () =>
{
    const canvas = document.getElementById('canvas-game')
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.strokeRect(0, 0, window.innerWidth, window.innerHeight);
    const canvasRatio = canvas.width / canvas.height;

    const displayScore = document.getElementById('score')
    const displayPV = document.getElementById('pv')


    /* ------------- Load mages ------------- */
    const gameImages = {}

    const images = ['ship', 'shoot', 'alien', 'shootAlien'];
    const promiseArray = images.map(function (imageName)
    {
        const prom = new Promise(function (resolve)
        {
            gameImages[imageName] = new Image()
            gameImages[imageName].src = `Ressources/Images/${imageName}.png`
            gameImages[imageName].onload = function ()
            {
                resolve();
            };
        });
        return prom;
    });

    Promise.all(promiseArray).then(() =>
    {
        init()
    });


    const init = () =>
    {
        let endMessage

        const ship =
            {
            width: gameImages.ship.width / canvasRatio,
            height: gameImages.ship.height / canvasRatio,
            x: canvas.width / 2 - gameImages.ship.width / canvasRatio / 2,
            y: canvas.height - gameImages.ship.height / canvasRatio,
            sprite: gameImages.ship,
            direction: 1,
            pv: 100,
            damages: 20,
            touch: false,
            shootCounter: 0,
            score: 0,
            speed: 10,
            inMovement: false,
            inShoot: false,

            shoot: function ()
            {
                if (this.inShoot == true && this.shootCounter == 0)
                {
                    addShoot(this.x, this.y, 15);
                    this.shootCounter = 10;
                }
                this.shootCounter--;

                if (this.shootCounter < 0)
                    this.shootCounter = 0;
            },

            move: function ()
            {
                if (this.inMovement == true)
                {
                    this.x += this.speed * this.direction;

                    if (this.x < 0 || this.x > canvas.width - this.width)
                        this.x += this.speed * -this.direction;
                }
            },

            degats: function ()
            {
                if (this.touch == true)
                {
                    this.pv -= this.damages;
                    this.touch = false;
                    displayPV.value = this.pv
                }

                if (this.pv < 0)
                    this.pv = 0;

                else if (this.pv == 0)
                    endMessage = "You loose"

            },

            update: function ()
            {
                this.move();
                this.shoot();
                this.degats();
                ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
            }
        };


        const addAlien = function (_x, _y)
        {
            const alien = {
                x: _x,
                y: _y,
                width: gameImages.alien.width / canvasRatio,
                height: gameImages.alien.height / canvasRatio,
                speed: 3,
                dir: 1,
                dirSwitch: false,
                shootCounter: Math.floor((Math.random() * 400) + 5),

                shoot: function ()
                {
                    if (this.shootCounter == 0)
                    {
                        addShootAlien(this.x, this.y);
                        this.shootCounter = Math.floor((Math.random() * 400) + 5);
                    }
                    this.shootCounter--;

                    if (this.shootCounter < 0)
                        this.shootCounter = 0;
                },

                move: function ()
                {
                    this.x = this.x + this.speed * this.dir;
                    if (this.x < 0 || this.x > canvas.width - this.width)
                    {
                        if (this.y + this.height > ship.y - ship.height)
                            endMessage = "You loose, aliens are on you !"


                        else
                        {
                            this.y += this.height
                            this.dir = -this.dir
                        }
                    }
                },

                update: function ()
                {
                    this.shoot()
                    this.move()
                    ctx.drawImage(gameImages.alien, this.x, this.y, this.width, this.height);
                }
            };
            aliens.push(alien);
        };

        const aliens = [];


        const addShoot = function (_x, _y)
        {
            const shoot = {
                x: _x + ship.width / 2 - gameImages.shoot.width / 2,
                y: _y,
                speed: 10,
                update: function ()
                {
                    this.y -= this.speed;
                    ctx.drawImage(gameImages.shoot, this.x, this.y);
                    for (var shoot in shoots)
                    {
                        if (shoots[shoot].y < 0 - gameImages.shoot.height)
                            shoots.splice(shoot, 1);
                    }
                }
            };
            shoots.push(shoot);
        };

        const shoots = [];


        const addShootAlien = function (_x, _y)
        {
            const shootAlien = {
                x: _x + aliens[0].width / 2 - aliens[0].width / 2,
                y: _y + aliens[0].height,
                speed: 10,
                update: function ()
                {
                    this.y += this.speed;
                    ctx.drawImage(gameImages.shootAlien, this.x, this.y);
                    for (var shootAlien in shootsAlien)
                    {
                        if (shootsAlien[shootAlien].y > canvas.height)
                            shootsAlien.splice(shootAlien, 1);
                    }
                }
            };
            shootsAlien.push(shootAlien);
        };

        const shootsAlien = [];


        function create()
        {
            displayScore.innerHTML = ship.score
            displayPV.value = ship.pv

            update();

            // Create all aliens
            (() =>
            {
                const aliensNumber = 5
                for (let x = 0; x < aliensNumber; x++)
                {
                    addAlien(canvas.width / aliensNumber * x, 0);
                }
                console.log(aliens)
            })()
        }


        function collision()
        {
            for (var alien in aliens)
            {
                for (var shoot in shoots)
                {
                    if (shoots[shoot].y < aliens[alien].y + aliens[0].height &&
                        aliens[alien].x + aliens[0].width > shoots[shoot].x &&
                        shoots[shoot].x > aliens[alien].x &&
                        shoots[shoot].speed > 0)
                    {
                        aliens.splice(alien, 1)
                        shoots.splice(shoot, 1)
                        ship.score += 1
                        displayScore.innerHTML = ship.score
                        if (aliens.length == 0)
                            endMessage = "You Win"
                    }
                }
            }

            for (var shootAlien in shootsAlien)
            {
                if (shootsAlien[shootAlien].y + gameImages.shootAlien.height > ship.y &&
                    shootsAlien[shootAlien].x > ship.x &&
                    shootsAlien[shootAlien].x + gameImages.shootAlien.width < ship.x + ship.width)
                {
                    console.log("touché")
                    ship.touch = true;
                    shootsAlien.splice(shootAlien, 1);
                }
            }
        }


        function update()
        {
            if (!endMessage)
            {
                setTimeout(update, 20);
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                collision();

                ship.update();
                aliens.map(function (alien)
                {
                    alien.update();
                });
                shoots.map(function (shoot)
                {
                    shoot.update();
                });
                shootsAlien.map(function (shootAlien)
                {
                    shootAlien.update();
                });
            }

            // End of game
            else
            {
                document.getElementById('end').style.display = 'block'
                document.getElementById('endMessage').innerHTML = endMessage
            }

        }

        create();


        document.onkeydown = function (key)
        {
            // Left
            if (key.keyCode === 37)
            {
                ship.inMovement = true;
                ship.direction = -1;
            }

            // Right
            if (key.keyCode === 39)
            {
                ship.inMovement = true;
                ship.direction = 1;
            }

            // Space
            if (key.keyCode === 32)
                ship.inShoot = true;

        };

        document.onkeyup = function (key)
        {
            if (key.keyCode === 37 && ship.direction == -1)
                ship.inMovement = false;

            if (key.keyCode === 39 && ship.direction == 1)
                ship.inMovement = false;

            if (key.keyCode === 32)
                ship.inShoot = false;
        };
    }

}
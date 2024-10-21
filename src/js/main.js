AOS.init({
  once: true,
  disable: 'phone',
  duration: 1000,
  easing: 'ease-out-cubic',
});

const clientsEl = document.querySelectorAll('.clients-carousel');
if (clientsEl.length > 0) {
  const clients = new Swiper('.clients-carousel', {
    slidesPerView: 'auto',
    spaceBetween: 64,
    centeredSlides: true,
    loop: true,
    speed: 5000,
    noSwiping: true,
    noSwipingClass: 'swiper-slide',
    autoplay: {
      delay: 0,
      disableOnInteraction: true,
    },
  });
}

const carouselEl = document.querySelectorAll('.testimonials-carousel');
if (carouselEl.length > 0) {
  const carousel = new Swiper('.testimonials-carousel', {
    breakpoints: {
      320: {
        slidesPerView: 1
      },
      640: {
        slidesPerView: 2
      },
      1024: {
        slidesPerView: 3
      }
    },
    grabCursor: true,
    loop: false,
    centeredSlides: false,
    initialSlide: 0,
    spaceBetween: 24,
    navigation: {
      nextEl: '.carousel-next',
      prevEl: '.carousel-prev',
    },
  });
}

class ParticleAnimation {
  constructor(el, { quantity = 30, staticity = 50, ease = 50 } = {}) {
    this.canvas = el;
    if (!this.canvas) return;
    this.canvasContainer = this.canvas.parentElement;
    this.context = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.settings = {
      quantity: quantity,
      staticity: staticity,
      ease: ease,
    };
    this.circles = [];
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.canvasSize = {
      w: 0,
      h: 0,
    };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.initCanvas = this.initCanvas.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawCircle = this.drawCircle.bind(this);
    this.drawParticles = this.drawParticles.bind(this);
    this.remapValue = this.remapValue.bind(this);
    this.animate = this.animate.bind(this);
    this.init();
  }

  init() {
    this.initCanvas();
    this.animate();
    window.addEventListener('resize', this.initCanvas);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  initCanvas() {
    this.resizeCanvas();
    this.drawParticles();
  }

  onMouseMove(event) {
    const { clientX, clientY } = event;
    const rect = this.canvas.getBoundingClientRect();
    const { w, h } = this.canvasSize;
    const x = clientX - rect.left - (w / 2);
    const y = clientY - rect.top - (h / 2);
    const inside = x < (w / 2) && x > -(w / 2) && y < (h / 2) && y > -(h / 2);
    if(inside) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  resizeCanvas() {
    this.circles.length = 0;
    this.canvasSize.w = this.canvasContainer.offsetWidth;
    this.canvasSize.h = this.canvasContainer.offsetHeight;
    this.canvas.width = this.canvasSize.w * this.dpr;
    this.canvas.height = this.canvasSize.h * this.dpr;
    this.canvas.style.width = this.canvasSize.w + 'px';
    this.canvas.style.height = this.canvasSize.h + 'px';
    this.context.scale(this.dpr, this.dpr);
  }

  circleParams() {
    const x = Math.floor(Math.random() * this.canvasSize.w);
    const y = Math.floor(Math.random() * this.canvasSize.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;
    return { x, y, translateX, translateY, size, alpha, targetAlpha, dx, dy, magnetism };
  }

  drawCircle(circle, update = false) {
    const { x, y, translateX, translateY, size, alpha } = circle;
    this.context.translate(translateX, translateY);
    this.context.beginPath();
    this.context.arc(x, y, size, 0, 2 * Math.PI);
    this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.context.fill();
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!update) {
      this.circles.push(circle);
    }
  }

  clearContext() {
    this.context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  }

  drawParticles() {
    this.clearContext();
    const particleCount = this.settings.quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = this.circleParams();
      this.drawCircle(circle);
    }
  }

  remapValue(value, start1, end1, start2, end2) {
    const remapped = (value - start1) * (end2 - start2) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }

  animate() {
    this.clearContext();
    this.circles.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        this.canvasSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        this.canvasSize.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2);
      if(remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if(circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX += ((this.mouse.x / (this.settings.staticity / circle.magnetism)) - circle.translateX) / this.settings.ease;
      circle.translateY += ((this.mouse.y / (this.settings.staticity / circle.magnetism)) - circle.translateY) / this.settings.ease;
      if (circle.x < -circle.size || circle.x > this.canvasSize.w + circle.size || circle.y < -circle.size || circle.y > this.canvasSize.h + circle.size) {
        this.circles.splice(i, 1);
        const circle = this.circleParams();
        this.drawCircle(circle);
      } else {
        this.drawCircle({ ...circle, x: circle.x, y: circle.y, translateX: circle.translateX, translateY: circle.translateY, alpha: circle.alpha }, true);
      }
    });
    window.requestAnimationFrame(this.animate);
  }
}

const canvasElements = document.querySelectorAll('[data-particle-animation]');
canvasElements.forEach(canvas => {
  const options = {
    quantity: canvas.dataset.particleQuantity,
    staticity: canvas.dataset.particleStaticity,
    ease: canvas.dataset.particleEase,
  };
  new ParticleAnimation(canvas, options);
});


class Highlighter {
  constructor(containerElement) {
    this.container = containerElement;
    this.boxes = Array.from(this.container.children);
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.containerSize = {
      w: 0,
      h: 0,
    };
    this.initContainer = this.initContainer.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.init();
  }

  initContainer() {
    this.containerSize.w = this.container.offsetWidth;
    this.containerSize.h = this.container.offsetHeight;
  }

  onMouseMove(event) {
    const { clientX, clientY } = event;
    const rect = this.container.getBoundingClientRect();
    const { w, h } = this.containerSize;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const inside = x < w && x > 0 && y < h && y > 0;
    if (inside) {
      this.mouse.x = x;
      this.mouse.y = y;
      this.boxes.forEach((box) => {
        const boxX = -(box.getBoundingClientRect().left - rect.left) + this.mouse.x;
        const boxY = -(box.getBoundingClientRect().top - rect.top) + this.mouse.y;
        box.style.setProperty('--mouse-x', `${boxX}px`);
        box.style.setProperty('--mouse-y', `${boxY}px`);
      });
    }
  }

  init() {
    this.initContainer();
    window.addEventListener('resize', this.initContainer);
    window.addEventListener('mousemove', this.onMouseMove);
  }
}

const highlighters = document.querySelectorAll('[data-highlighter]');
highlighters.forEach((highlighter) => {
  new Highlighter(highlighter);
});

var verJson = [];
var releaseJson = [];

// Mostrar/ocultar menu de acessibilidade
document.getElementById('accessibility-btn').addEventListener('click', function () {
    const menu = document.getElementById('accessibility-menu');
    menu.style.display = menu.style.display === 'none' || menu.style.display === '' ? 'block' : 'none';
});

// Toggle sections
document.querySelectorAll('.toggle-button').forEach(button => {
    button.addEventListener('click', function () {
        const target = document.querySelector(this.dataset.target);
        target.style.display = target.style.display === 'none' || target.style.display === '' ? 'block' : 'none';
        this.classList.toggle('collapsed');
    });
});

// Ajustar largura das seções
document.getElementById('section-width').addEventListener('change', function () {
    const newWidth = this.value;
    document.querySelectorAll('.section').forEach(section => {
        section.style.width = newWidth;
    });
});

// Ajustar alinhamento das seções
document.getElementById('alignment').addEventListener('change', function () {
    const newAlign = this.value;
    document.querySelector('main').style.justifyContent = newAlign;
});

// Adicionando suporte ao alinhamento dos cabeçalhos "Beta" e "Releases"
document.addEventListener('DOMContentLoaded', function() {
  const betaHeader = document.getElementById('beta-header');
  const releasesHeader = document.getElementById('releases-header');

  // Função para alterar o alinhamento
  function changeHeaderAlignment(header, alignment) {
      switch(alignment) {
          case 'left':
              header.style.textAlign = 'left';
              break;
          case 'center':
              header.style.textAlign = 'center';
              break;
          case 'right':
              header.style.textAlign = 'right';
              break;
      }
  }

  // Eventos de alteração de alinhamento para os cabeçalhos "Beta" e "Releases"
  document.getElementById('beta-alignment').addEventListener('change', function() {
      const alignment = this.value;
      changeHeaderAlignment(betaHeader, alignment);
  });

  document.getElementById('releases-alignment').addEventListener('change', function() {
      const alignment = this.value;
      changeHeaderAlignment(releasesHeader, alignment);
  });
});

// Reset para as configurações padrão
document.getElementById('reset-defaults').addEventListener('click', function () {
  // Reseta para largura de 50% e alinhamento central
  document.querySelectorAll('.section').forEach(section => {
      section.style.width = "48%";
  });
  document.querySelector('main').style.justifyContent = "space-between";
  document.getElementById('section-width').value = "50%";
  document.getElementById('alignment').value = "center";

  // Resetar alinhamento dos cabeçalhos "Beta" e "Releases"
  document.getElementById('beta-alignment').value = "center";
  document.getElementById('releases-alignment').value = "center";
  document.getElementById('beta-header').style.textAlign = 'center';
  document.getElementById('releases-header').style.textAlign = 'center';
});

async function fetchDownloadCount() {
    let totalDownloads = 0;
    const response = await fetch('https://api.github.com/repos/SkidderMC/FDPClient/releases');
    const data = await response.json();

    data.forEach(release => {
        release.assets.forEach(asset => {
            totalDownloads += asset.download_count;
        });
    });

    document.getElementById('download-count').innerText = `GitHub Downloads: ${totalDownloads} (Thanks for 100k+ Downloads!)`;
}

function addBetaVer(sha, time, msg, artifact_id) {
    verJson.push({
        link: "https://github.com/SkidderMC/FDPClient/commit/" + sha,
        sha: sha,
        time: new Date(time),
        msg: msg,
        download_link: "https://nightly.link/SkidderMC/FDPClient/actions/runs/" + artifact_id + "/FDPClient.zip"
    });
    refreshBeta();
}

function addRelease(tag_name, time, changelog_url, download_count) {
    releaseJson.push({
        tag_name: tag_name,
        time: new Date(time),
        changelog_link: changelog_url,
        download_count: download_count
    });
    refreshReleases();
}

function refreshBeta() {
    $('#loading-badge').html("");
    $("#tbody").html("");
    verJson.sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 30)
        .forEach(element => {
            $("#tbody").append(`<tr>
    <td><a href="${element.link}" style="color:#FFFFFF"> ${element.sha.substring(0, 7)}</a></td>
    <td>${element.time.toLocaleString()}</td>
    <td><a href="${element.download_link}" style="color:#7289da">Download</a></td>
    <td>${element.msg}</td>
</tr>`);
        });
}

function refreshReleases() {
    $('#releases-tbody').html("");
    releaseJson.sort((a, b) => b.time.getTime() - a.time.getTime()).forEach(element => {
        $("#releases-tbody").append(`
            <div class="release-info">
                <strong>${element.tag_name}</strong> (${element.time.toLocaleDateString()})<br>
                <a href="${element.changelog_link}" target="_blank">View Release</a><br>
                <span>Download Count: ${element.download_count}</span>
            </div>
        `);
    });
}

async function fetchWorkflowRuns() {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        const response = await fetch(`https://api.github.com/repos/SkidderMC/FDPClient/actions/runs?per_page=100&page=${page}`);
        const data = await response.json();

        if (data.workflow_runs.length > 0) {
            data.workflow_runs.forEach(element => {
                addBetaVer(element.head_commit.id, element.head_commit.timestamp, element.head_commit.message, element.id);
            });
            page++;
        } else {
            hasMorePages = false;
        }
    }
}

// Fetch releases from GitHub
async function fetchReleases() {
    const response = await fetch(`https://api.github.com/repos/SkidderMC/FDPClient/releases`);
    const data = await response.json();

    data.forEach(release => {
        let downloadCount = release.assets.reduce((total, asset) => total + asset.download_count, 0);
        addRelease(release.tag_name, release.published_at, release.html_url, downloadCount);
    });
}

fetchDownloadCount();
fetchWorkflowRuns();
fetchReleases();

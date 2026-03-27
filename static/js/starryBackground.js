// starryBackground.js - Универсальный интерактивный фон для всех страниц

class StarryBackground {
    constructor(canvasId = 'bgCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.connections = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.width = 0;
        this.height = 0;
        this.animationId = null;
        this.isActive = true;
        
        this.colors = {
            star: ['#fff', '#ffe9c4', '#fff0d0', '#ffd700'],
            connection: 'rgba(108, 92, 231, 0.5)',
            hoverConnection: 'rgba(0, 206, 201, 0.8)'
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.initStars(45);
        this.animate();
        this.addEventListeners();
    }
    
    initStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push(this.createStar());
        }
        this.updateStats();
    }
    
    createStar(x, y, vx, vy) {
        return {
            x: x !== undefined ? x : Math.random() * this.width,
            y: y !== undefined ? y : Math.random() * this.height,
            vx: vx !== undefined ? vx : (Math.random() - 0.5) * 0.3,
            vy: vy !== undefined ? vy : (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 3 + 2,
            color: this.colors.star[Math.floor(Math.random() * this.colors.star.length)],
            glow: Math.random() * 0.5 + 0.3
        };
    }
    
    updateStar(star) {
        star.x += star.vx;
        star.y += star.vy;
        
        if (star.x < 0 || star.x > this.width) {
            star.vx *= -1;
            star.x = Math.max(0, Math.min(this.width, star.x));
        }
        if (star.y < 0 || star.y > this.height) {
            star.vy *= -1;
            star.y = Math.max(0, Math.min(this.height, star.y));
        }
    }
    
    isHovered(star, mx, my) {
        const dx = star.x - mx;
        const dy = star.y - my;
        return Math.sqrt(dx * dx + dy * dy) < star.radius + 15;
    }
    
    updateConnections() {
        this.connections = [];
        
        const hoveredStars = this.stars.filter(star => this.isHovered(star, this.mouseX, this.mouseY));
        
        if (hoveredStars.length > 0) {
            hoveredStars.forEach(hovered => {
                this.stars.forEach(other => {
                    if (hovered !== other) {
                        const dx = hovered.x - other.x;
                        const dy = hovered.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 180) {
                            this.connections.push({
                                from: hovered,
                                to: other,
                                distance: distance,
                                isHovered: true
                            });
                        }
                    }
                });
            });
        }
        
        // Фоновые связи между близкими звёздами
        for (let i = 0; i < this.stars.length; i++) {
            for (let j = i + 1; j < this.stars.length; j++) {
                const dx = this.stars[i].x - this.stars[j].x;
                const dy = this.stars[i].y - this.stars[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120 && !hoveredStars.length) {
                    this.connections.push({
                        from: this.stars[i],
                        to: this.stars[j],
                        distance: distance,
                        isHovered: false
                    });
                }
            }
        }
        
        this.updateStats();
    }
    
    drawConnections() {
        this.connections.forEach(conn => {
            const opacity = conn.isHovered ? 
                Math.min(0.8, 1 - conn.distance / 180) : 
                Math.min(0.3, 1 - conn.distance / 120);
            
            const color = conn.isHovered ? this.colors.hoverConnection : this.colors.connection;
            
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = conn.isHovered ? 2.5 : 1;
            this.ctx.shadowBlur = conn.isHovered ? 5 : 0;
            this.ctx.stroke();
        });
        this.ctx.shadowBlur = 0;
    }
    
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.save();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(108, 92, 231, 0.5)';
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius * 1.3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(108, 92, 231, ${0.15 * star.glow})`;
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawCursorGlow() {
        if (this.mouseX > 0 && this.mouseY > 0) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 12, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(108, 92, 231, 0.2)';
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 206, 201, 0.3)';
            this.ctx.fill();
        }
    }
    
    animate() {
        if (!this.ctx || !this.isActive) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.stars.forEach(star => this.updateStar(star));
        this.updateConnections();
        
        this.drawConnections();
        this.drawStars();
        this.drawCursorGlow();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    addStar(x, y) {
        const newStar = this.createStar(x, y, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
        newStar.radius = 0;
        this.stars.push(newStar);
        
        let grow = 0;
        const growInterval = setInterval(() => {
            grow += 0.3;
            newStar.radius = Math.min(3, grow);
            if (grow >= 3) clearInterval(growInterval);
        }, 30);
        
        this.updateStats();
    }
    
    clearStars() {
        this.stars = [];
        this.initStars(45);
    }
    
    updateStats() {
        const starCountElem = document.getElementById('starCount');
        const connCountElem = document.getElementById('connectionCount');
        if (starCountElem) starCountElem.textContent = this.stars.length;
        if (connCountElem) connCountElem.textContent = this.connections.length;
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if (this.stars.length > 0) {
            const oldStars = this.stars;
            this.stars = [];
            oldStars.forEach(star => {
                this.stars.push(this.createStar(
                    Math.min(this.width, Math.max(0, star.x)),
                    Math.min(this.height, Math.max(0, star.y)),
                    star.vx,
                    star.vy
                ));
            });
        } else {
            this.initStars(45);
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        
        this.mouseX = Math.max(0, Math.min(this.width, this.mouseX));
        this.mouseY = Math.max(0, Math.min(this.height, this.mouseY));
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;
        
        x = Math.max(0, Math.min(this.width, x));
        y = Math.max(0, Math.min(this.height, y));
        
        this.addStar(x, y);
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Правый клик для очистки (опционально)
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.clearStars();
            return false;
        });
    }
    
    destroy() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', () => this.resize());
    }
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bgCanvas')) {
        window.starryBackground = new StarryBackground('bgCanvas');
    }
});
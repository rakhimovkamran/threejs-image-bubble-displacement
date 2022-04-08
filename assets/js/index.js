import * as THREE from "three"

import fragment from "/shaders/fragment.glsl"
import vertex from "/shaders/vertex.glsl"

import * as dat from "dat.gui"

import CoverImage from "../images/cover.jpg"

export default class Sketch {
    constructor() {
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer()
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)
        this.renderer.setClearColor(0x000000, 1)

        this.container = document.getElementById("container")
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.container.appendChild(this.renderer.domElement)

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        )

        this.raycaster = new THREE.Raycaster()

        this.camera.position.set(0, 0, 2)

        this.time = 0

        this.paused = false

        this.setupResize()

        this.addObjects()
        this.resize()
        this.render()
        this.settings()
        this.pointerEvent()
    }

    pointerEvent() {
        const that = this

        this.pointer = new THREE.Vector2()

        function onPointerMove(event) {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components

            that.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
            that.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

            // update the picking ray with the camera and pointer position
            that.raycaster.setFromCamera(that.pointer, that.camera)

            // calculate objects intersecting the picking ray
            const intersects = that.raycaster.intersectObjects(
                that.scene.children
            )

            if (intersects.length > 0) {
                that.material.uniforms.pointer.value = intersects[0]?.point
            }

            // for (let i = 0; i < intersects.length; i++) {
            //     intersects[i].object.material.color.set(0xff0000)
            // }

            that.renderer.render(that.scene, that.camera)
        }

        window.addEventListener("pointermove", onPointerMove)
    }

    settings() {
        let that = this
        this.settings = {
            progress: 0,
        }
        this.gui = new dat.GUI()
        this.gui.add(this.settings, "progress", 0, 1, 0.01)
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this))
    }

    resize() {
        this.width = this.container.offsetWidth
        this.height = this.container.offsetHeight
        this.renderer.setSize(this.width, this.height)
        this.camera.aspect = this.width / this.height

        this.imageAspect = 853 / 1280
        let a1
        let a2
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect
            a2 = 1
        } else {
            a1 = 1
            a2 = this.height / this.width / this.imageAspect
        }

        this.material.uniforms.resolution.value.x = this.width
        this.material.uniforms.resolution.value.y = this.height
        this.material.uniforms.resolution.value.z = a1
        this.material.uniforms.resolution.value.w = a2

        this.camera.updateProjectionMatrix()
    }

    addObjects() {
        let that = this
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable",
            },

            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                cover: {
                    type: "t",
                    value: new THREE.TextureLoader().load(CoverImage),
                },

                pointer: {
                    type: "v3",
                    value: new THREE.Vector3(),
                },

                progress: { type: "f", value: 0 },

                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: {
                    value: new THREE.Vector2(1, 1),
                },
            },

            vertexShader: vertex,
            fragmentShader: fragment,
        })

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

        this.plane = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.plane)
    }

    stop() {
        this.paused = true
    }

    play() {
        this.paused = false
        this.render()
    }

    render() {
        if (this.paused) return
        this.time += 0.05
        this.material.uniforms.time.value = this.time
        this.material.uniforms.progress.value = this.settings.progress
        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)
    }
}

new Sketch("container")

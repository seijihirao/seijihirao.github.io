import { useCallback } from 'react';
import Particles from 'react-particles';
import type { Container, Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';

export default function Home() {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine)

    // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine)
  }, [])

  const particlesLoaded = useCallback(
    async (container: Container | undefined) => {
      await console.log(container);
    },
    []
  )

  return (
    <div className='hero w-full min-h-screen px-5'>
      <Particles id="tsparticles" url="/data/particles.json" init={particlesInit} loaded={particlesLoaded} className='h-full w-full'/>
      <div>
        <h1 className="text-7xl font-bold">Rodrigo Seiji P. Hirao</h1>
        <h2 className="text-3xl font-bold">Software Engineer</h2>
      </div>
    </div>
  )
}

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

public sealed class VfxExperimentRunner : MonoBehaviour
{
    [Serializable] class CheckResult { public string name; public bool passed; }
    [Serializable] class Report {
        public string engine, gpu, graphicsApi, platform, scope="Unity Editor Play Mode, synthetic scene; not a shipped game or device benchmark";
        public bool passed; public List<CheckResult> checks=new List<CheckResult>(); public List<string> errors=new List<string>();
        public List<float> impactSeconds=new List<float>(), slashSeconds=new List<float>();
        public float maxFrameSeconds;
    }
    Report report=new Report(); Camera cameraView; RenderTexture target;
    string output;
    void Awake() {
        output=Path.GetFullPath("output");
        var args=Environment.GetCommandLineArgs();
        for(int i=0;i<args.Length-1;i++) if(args[i]=="-vfxOutput") output=Path.GetFullPath(args[i+1]);
        Directory.CreateDirectory(output);
        Application.logMessageReceived += Log;
        report.engine=Application.unityVersion; report.gpu=SystemInfo.graphicsDeviceName;
        report.graphicsApi=SystemInfo.graphicsDeviceType.ToString(); report.platform=Application.platform.ToString();
    }
    void Log(string message,string stack,LogType type) { if(type==LogType.Exception || type==LogType.Error || type==LogType.Assert) report.errors.Add(message); }
    void Update() { report.maxFrameSeconds=Mathf.Max(report.maxFrameSeconds,Time.unscaledDeltaTime); }
    void Check(string name,bool passed) { report.checks.Add(new CheckResult{name=name,passed=passed}); Debug.Log("VFX CHECK "+name+": "+passed); }
    SheetEffect Effect(string name,float x) {
        var obj=new GameObject(name);obj.transform.position=new Vector3(x,0,0);
        var effect=obj.AddComponent<SheetEffect>();effect.Configure(name);return effect;
    }
    int Capture(string name,Color background) {
        cameraView.backgroundColor=background;cameraView.Render();
        var previous=RenderTexture.active;RenderTexture.active=target;
        var image=new Texture2D(target.width,target.height,TextureFormat.RGBA32,false);
        image.ReadPixels(new Rect(0,0,target.width,target.height),0,0);image.Apply();
        int visible=0;var pixels=image.GetPixels32();var bg=pixels[0];
        foreach(var pixel in pixels) if(Math.Abs(pixel.r-bg.r)+Math.Abs(pixel.g-bg.g)+Math.Abs(pixel.b-bg.b)>25)visible++;
        File.WriteAllBytes(Path.Combine(output,name+".png"),image.EncodeToPNG());
        Destroy(image);RenderTexture.active=previous;return visible;
    }
    IEnumerator Start()
    {
        cameraView=new GameObject("Camera").AddComponent<Camera>();cameraView.transform.position=new Vector3(0,0,-10);
        cameraView.orthographic=true;cameraView.orthographicSize=1.6f;cameraView.clearFlags=CameraClearFlags.SolidColor;
        target=new RenderTexture(960,480,24);cameraView.targetTexture=target;
        var effects=new[]{Effect("impact",-2),Effect("slash",0),Effect("embers",2)};
        var dark=new Color(.06f,.09f,.13f,1);var light=new Color(.88f,.86f,.80f,1);
        foreach(var effect in effects) {
            float sum=0;foreach(var frame in effect.Data.frames)sum+=frame.durationMs/1000;
            Check(effect.name+" duration metadata",Mathf.Abs(sum-effect.Data.durationSeconds)<.00001f);
            Check(effect.name+" original texture dimensions",effect.Renderer.sprite.texture.width==effect.Data.width&&effect.Renderer.sprite.texture.height==effect.Data.height);
            Check(effect.name+" pivot",effect.Renderer.sprite.pivot==new Vector2(64,64));
        }
        for(int i=0;i<10;i++)yield return null;
        foreach(var effect in effects)effect.Restart();
        for(int frame=0;frame<20;frame++) {
            yield return new WaitForSecondsRealtime(.05f);
            Capture("sequence-"+frame.ToString("D2"),dark);
        }
        Check("one shots complete",!effects[0].Playing&&!effects[1].Playing&&effects[0].Completions==1&&effects[1].Completions==1);
        while(effects[2].Age<effects[2].Data.durationSeconds*2+.1f)yield return null;
        Check("loop survives multiple periods",effects[2].Playing&&effects[2].Completions==0);
        effects[2].Paused=true;int paused=effects[2].FrameIndex;float age=effects[2].Age;
        yield return new WaitForSecondsRealtime(.15f);
        Check("pause preserves frame and time",paused==effects[2].FrameIndex&&age==effects[2].Age);
        effects[2].Paused=false;yield return new WaitForSecondsRealtime(.1f);
        Check("resume advances",effects[2].Age>age);
        foreach(var effect in effects)effect.Restart();
        yield return new WaitForSecondsRealtime(.12f);
        Check("dark render has visible effects",Capture("dark",dark)>100);
        Check("light render has visible effects",Capture("light",light)>100);
        foreach(var effect in effects)effect.Cancel();
        Check("cancel clears renderer",Capture("cancelled",dark)==0);
        // Time measurements exclude capture/PNG work; record frame uncertainty separately.
        report.maxFrameSeconds=0;
        for(int trial=0;trial<3;trial++)for(int i=0;i<2;i++) {
            for(int warm=0;warm<10;warm++)yield return null;
            float started=Time.realtimeSinceStartup;effects[i].Restart();
            float maxDelta=0;
            while(effects[i].Playing) { maxDelta=Mathf.Max(maxDelta,Time.unscaledDeltaTime);yield return null; }
            float elapsed=effects[i].FinishTime-started;
            (i==0?report.impactSeconds:report.slashSeconds).Add(elapsed);
            Check(effects[i].name+" timing "+trial,maxDelta<=.05f&&Mathf.Abs(elapsed-effects[i].Data.durationSeconds)<=2*maxDelta+.005f);
        }
        var overlap=new List<SheetEffect>();for(int i=0;i<24;i++){var e=Effect("impact",(i%6-2.5f)*.5f);e.transform.position+=Vector3.up*(i/6-1.5f)*.4f;e.Restart();overlap.Add(e);}
        yield return new WaitForSecondsRealtime(.1f);
        Check("overlapping instances render",Capture("overlap",dark)>100);
        yield return new WaitForSecondsRealtime(.65f);
        Check("all overlapping instances finish",overlap.TrueForAll(e=>!e.Playing&&!e.Renderer.enabled));
        foreach(var e in overlap)Destroy(e.gameObject);
        effects[2].Restart();Destroy(effects[0].gameObject);yield return null;
        Check("owner removal preserves other owner",effects[0]==null&&effects[2].Playing);effects[2].Cancel();
        var particleObject=new GameObject("Native particle burst");var particles=particleObject.AddComponent<ParticleSystem>();particles.Stop(true,ParticleSystemStopBehavior.StopEmittingAndClear);
        var main=particles.main;main.loop=false;main.startLifetime=.4f;main.startSpeed=0;main.startSize=.12f;main.maxParticles=64;main.simulationSpace=ParticleSystemSimulationSpace.World;
        var emission=particles.emission;emission.enabled=false;var shape=particles.shape;shape.enabled=false;
        var material=new Material(Shader.Find("Sprites/Default"));particleObject.GetComponent<ParticleSystemRenderer>().sharedMaterial=material;
        particles.useAutoRandomSeed=false;particles.randomSeed=23;particles.Play();
        for(int i=0;i<12;i++){float a=i*Mathf.PI/6;particles.Emit(new ParticleSystem.EmitParams{position=Vector3.zero,velocity=new Vector3(Mathf.Cos(a),Mathf.Sin(a),0)*2,startColor=new Color(1,.6f,.15f,1)},1);}
        Check("native burst count",particles.particleCount==12);
        yield return new WaitForSecondsRealtime(.12f);
        Check("native particles rendered",Capture("native-particles",dark)>20);
        yield return new WaitForSecondsRealtime(.45f);Check("native particles expire",particles.particleCount==0);
        particles.Emit(1000);Check("native particle budget",particles.particleCount<=64&&particles.particleCount>0);
        particles.Stop(true,ParticleSystemStopBehavior.StopEmittingAndClear);Check("native cancellation clears particles",particles.particleCount==0);
        Destroy(particleObject);Destroy(material);yield return null;
        Check("owner cleanup",particleObject==null);Check("simulation clock unchanged",Time.timeScale==1);
        Finish();
    }
    void Finish() {
        report.passed=report.errors.Count==0&&report.checks.TrueForAll(c=>c.passed);
        File.WriteAllText(Path.Combine(output,"results.json"),JsonUtility.ToJson(report,true));
        Debug.Log("VFX_RESULT "+report.passed);
        #if UNITY_EDITOR
        EditorApplication.Exit(report.passed?0:1);
        #endif
    }
    void OnDestroy(){Application.logMessageReceived-=Log;if(target!=null)target.Release();}
}

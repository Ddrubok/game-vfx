using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class VfxExperiment
{
    public static void Run()
    {
        foreach(var name in new[]{"impact","slash","embers"}) {
            var path="Assets/Resources/"+name+".png";
            var importer=(TextureImporter)AssetImporter.GetAtPath(path);
            importer.textureType=TextureImporterType.Default;
            importer.alphaIsTransparency=true; importer.mipmapEnabled=false;
            importer.npotScale=TextureImporterNPOTScale.None;
            importer.textureCompression=TextureImporterCompression.Uncompressed;
            importer.filterMode=FilterMode.Bilinear; importer.SaveAndReimport();
        }
        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        new GameObject("VFX experiment").AddComponent<VfxExperimentRunner>();
        EditorSceneManager.SaveScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene(), "Assets/Experiment.unity");
        EditorApplication.EnterPlaymode();
    }
}

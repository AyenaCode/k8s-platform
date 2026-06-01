## Y accéder de l'extérieur (NodePort)

Un ClusterIP n'est joignable qu'à *l'intérieur* du cluster. Un **NodePort** ouvre
un port (30000–32767) sur chaque nœud et le redirige vers le Service.

Créez un Service NodePort nommé **`web-np`** pour le même Deployment :

```bash
kubectl expose deployment web --name=web-np --type=NodePort --port=80
```

Trouvez le port attribué et appelez-le sur `localhost` (votre terminal *est* le
nœud) :

```bash
kubectl get svc web-np
# web-np   NodePort   10.43.x   <none>   80:31234/TCP

PORT=$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}')
curl localhost:$PORT          # 🎉 la page nginx, depuis l'extérieur du cluster
```

> Comme le terminal de ce lab partage le réseau du nœud, `localhost:<nodePort>`
> atteint votre app exactement comme le ferait un vrai nœud. Sur un cluster cloud,
> on utiliserait plutôt un **LoadBalancer** pour une IP externe propre.

Créez le Service NodePort **`web-np`**, confirmez que `curl localhost:$PORT`
fonctionne, puis cliquez sur **Vérifier**. ✅

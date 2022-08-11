---
title: 'How To Fix Keycloak Oauth2 OIDC Logout With Spring Cloud Gateway'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Gateway, Keycloak, Oauth2, OpenId Connect, Resource Server, Docker]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-08-11'
draft: false
summary: ' In this article, we look at how we can fix the keycloak Oauth2 OIDC logout issue with Spring Cloud Gateway'
imageUrl: /static/images/2022/fix-keycloak-oidc-logout-issue/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

This is the third part of the sequence of articles where we integrate Keycloak with Spring Cloud Gateway using the OIDC Oauth2 mechanism.

You can go through the previous articles here:

1.  [**Spring Cloud Gateway Keycloak OAuth2 OIDC Integration**](https://refactorfirst.com/spring-cloud-gateway-keycloak-oauth2-openid-connect)
2.  [**Spring Cloud Gateway — Resource Server with Keycloak RBAC**](https://refactorfirst.com/spring-cloud-gateway-keycloak-rbac-resource-server)

## What is the exact problem?

In my last articles, we communicated with the Spring Cloud Gateway application which is protected by the Keycloack Oauth2 OIDC authentication mechanism.

It all works like a charm until we reach the part of the logout.

When we try to logout using the `/logout` path, the user just logs out from the current session in the Spring API Gateway application, but when we try to access the protected resource again, it logs back in as the user did not log out of the Keycloak session.

So here is a quick article on how to fix this issue.

## Fixing the Logout Issue with Keycloak

Firstly, we need to add a logout handler to the API gateway's security settings.

For this, let's create a logout handler bean as below.

```java
@Bean
public ServerLogoutSuccessHandler keycloakLogoutSuccessHandler(ReactiveClientRegistrationRepository repository) {

       OidcClientInitiatedServerLogoutSuccessHandler oidcLogoutSuccessHandler =
               new OidcClientInitiatedServerLogoutSuccessHandler(repository);

       oidcLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}/logout.html");

       return oidcLogoutSuccessHandler;
   }
```

Here I create a Client Initiated Server Logout handler. This initiates user logout on the authorization server i.e. Keycloak in our case.

Now to get the list of registered authorization servers, it needs the Client Registry Repository. This is where all the clients that we registered in the properties file as below as stored.

```yaml
security:
    oauth2:
      client:
        provider:
          my-keycloak-provider:
            issuer-uri: http://localhost:8080/realms/My-Realm  registration:
          keycloak-spring-gateway-client:
            provider: my-keycloak-provider
            scope: openid
            client-id: spring-gateway-client
            client-secret: 3RhEF8pqKTANrQ6BhfxaYVmcjTXsDK0u
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/keycloak"
```

In addition to this, we need to add the scope as `openid` while registering the client as shown in the properties file above. This makes spring create a principal of type`OidcUser` when the user logs in.

Lastly, we have to set the logout handler in the security config as below.

```java
@Bean
public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http, ServerLogoutSuccessHandler handler) {

   http
      .authorizeExchange()
      .pathMatchers("/actuator/**", "/","/logout.html")
      .permitAll()
   .and()
      .authorizeExchange()
      .anyExchange()
      .authenticated()
   .and()
      .oauth2Login() // to redirect to oauth2 login page. .and()
      .logout()
      .logoutSuccessHandler(handler);


return http.build();
}
```

## Understanding this a little deeper

To understand this more deeper, Let’s have a look at the function `onLogoutSuccess` inside the `OidcClientInitiatedServerLogoutSuccessHandler`

```java
@Override
public Mono<Void> onLogoutSuccess(WebFilterExchange exchange, Authentication authentication) {
  return Mono.just(authentication)
         .filter(OAuth2AuthenticationToken.class::isInstance)
         .filter((token) -> authentication.getPrincipal() instanceof OidcUser)
         .map(OAuth2AuthenticationToken.class::cast)
         .map(OAuth2AuthenticationToken::getAuthorizedClientRegistrationId)
         .flatMap(this.clientRegistrationRepository::findByRegistrationId)
         .flatMap((clientRegistration) -> {
            URI endSessionEndpoint = endSessionEndpoint(clientRegistration);
            if (endSessionEndpoint == null) {
               return Mono.empty();
            }
            String idToken = idToken(authentication);
            String postLogoutRedirectUri = postLogoutRedirectUri(exchange.getExchange().getRequest());
            return Mono.just(endpointUri(endSessionEndpoint, idToken, postLogoutRedirectUri));
         })
....
```

In this function, you see that when the user logs out on the API gateway, on its success the token from the authenticated user is first checked if it was an `oidcuser`. It then finds the registered client from the client registration repository and then calls the end session endpoint of the Keycloak server.

## Conclusion

With this, we saw how we could fix the Keycloak logout issue with a simple fix.

You can refer to the entire code on my GitHub repo [here](https://github.com/amrutprabhu/keycloak-spring-cloud-gateway-and-resource-server).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!

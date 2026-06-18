<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Middleware;

use Closure;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Lattice\Lattice\Contracts\HasTimezonePreference;
use Lattice\Lattice\Http\I18nConfig;
use Symfony\Component\HttpFoundation\Response;

final class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $config = I18nConfig::fromConfig(timezone: $this->userTimezone($request));
        $locales = $config->locales;

        $this->shareConfig($config);

        if ($locales === []) {
            return $next($request);
        }

        $locale = $this->preferredLocale($request, $locales);

        if ($locale !== null) {
            App::setLocale($locale);
        }

        return $next($request);
    }

    private function shareConfig(I18nConfig $config): void
    {
        Inertia::share([
            'lattice.i18n' => Inertia::once(fn (): I18nConfig => $config),
        ]);
    }

    /**
     * @param  array<int, string>  $locales
     */
    private function preferredLocale(Request $request, array $locales): ?string
    {
        foreach ([
            $this->userLocale($request),
            $this->cookieLocale($request),
            $this->sessionLocale($request),
        ] as $locale) {
            if (is_string($locale) && in_array($locale, $locales, true)) {
                return $locale;
            }
        }

        $preferred = $request->getPreferredLanguage($locales);

        return is_string($preferred) && in_array($preferred, $locales, true) ? $preferred : null;
    }

    private function userTimezone(Request $request): ?string
    {
        $user = $request->user();

        if (! $user instanceof HasTimezonePreference) {
            return null;
        }

        $timezone = $user->preferredTimezone();

        return is_string($timezone) && $timezone !== '' ? $timezone : null;
    }

    private function userLocale(Request $request): ?string
    {
        $user = $request->user();

        if (! $user instanceof HasLocalePreference) {
            return null;
        }

        $locale = $user->preferredLocale();

        return is_string($locale) ? $locale : null;
    }

    private function cookieLocale(Request $request): ?string
    {
        $locale = $request->cookies->get('locale');

        return is_string($locale) ? $locale : null;
    }

    private function sessionLocale(Request $request): ?string
    {
        if (! $request->hasSession()) {
            return null;
        }

        $locale = $request->session()->get('locale');

        return is_string($locale) ? $locale : null;
    }
}

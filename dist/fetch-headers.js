export const fetchHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text-plain, */*',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    };
};

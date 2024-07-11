export function isValidYouTubeLink(url: string): boolean {
    const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);

    return !!match && match[2].length === 11;
}

export function getYoutubeId(url: string) {
    const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2].trim() : null;
}

export function getVimeoEmbedUrl(url: string) {
    const re = /\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i;
    const matches = re.exec(url);
    const hashCode = url.split?.('/')[4]?.split?.('?')[0];

    return (
        matches && 'https://player.vimeo.com/video/' + matches[1] + '?h=' + hashCode
    );
}

export function getYoutubeEmbedUrl(url: string): string {
    const videoId = getYoutubeId(url);

    return 'https://www.youtube.com/embed/' + videoId;
}

export function getFileExtension(url: string): string | null {
    // Regular expression to match and capture the file extension
    const regex = /\.([^.\/?#]+)(?:[?#]|$)/;
    const match = url.match(regex);
    return match ? match[1].toLowerCase() : null;
}

export function isAnImage(ext: string): boolean {
    return ['png', 'jpeg', 'jpg', 'gif', 'bmp', 'webp'].includes(ext)
}

export function isADocument(ext: string): boolean {
    return ['doc', 'docx', 'txt', 'rtf'].includes(ext)
}

export function isAPDF(ext: string): boolean {
    return ext === 'pdf'
}

export function isAnHtml(ext: string): boolean {
    return ext === 'htm' || ext === 'html'
}

export function isAnAudio(ext: string): boolean {
    return ['mp3', 'wav', 'm4a', 'aiff', 'flac', 'ogg', 'wma', 'alac', 'midi'].includes(ext)
}

export function isAVideo(ext: string): boolean {
    return ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'mpeg', 'mpg', 'webm', '3gp', 'm4v'].includes(ext)
}

export function isYouTubeLink(url: string): boolean {
    // Regular expression pattern for YouTube video URLs
    var youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;

    // Test the URL against the pattern
    return youtubePattern.test(url);
}

export function isVimeoLink(url: string) {
    // Regular expression pattern for Vimeo video URLs
    var vimeoPattern = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(?:channels\/[\w]+\/)?([\d]+)/;

    // Test the URL against the pattern
    return vimeoPattern.test(url);
}

export function getYoutubeVideoId(url: string) {
    // Regular expression pattern for extracting YouTube video IDs from both individual video URLs and playlist URLs
    var youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    // Test the URL against the pattern and extract the video ID
    var match = url.match(youtubePattern);
    if (match && match[1]) {
        return match[1]; // Return the extracted video ID
    } else {
        return null; // Return null if no match found
    }
}

export const AnyLink = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABTVBMVEUAAAASoIcWooUVn4dRwZtWw5wVoIVVxJwUn4UUoIUUoIUUoIUUoIUUoIUVoIUWoYYYoYcZoocaoogao4gbo4kco4kepIogpYshpYwipowmp44mp48nqI8pqZAuro4yrJU0rZY3rpc5r5g6r5k8sJo9sZs+sZtAspxCs51FtJ5KtqFMt6JSuaVTuaZUuqZVuqdWu6dXu6hdyKBevqteyKBfvqxgv6xgv61jwK5lwa9owrFqw7FsxLNv0qZwxbVw0aZy06dzxrZ1x7d9yryEzb+Hz8GJz8KK0MKT08eU1MeW1ciX1cmZ1sqb1sui2c+k2tCv39Wz4Ni14dm24tm44tq85Ny95N2+5d7C5t/F6OHH6OLK6ePP7ObR7OfV7unW7unY7+vZ8Ovh8+/j9PHl9fLm9fLr9/Ts9/Xt+PXt+Pb5/Pz5/fz6/f3+//////9wh9oEAAAADXRSTlMARkdIxMTHx8jJ+Pn+qBQQ8QAAAAFiS0dEbiIPURcAAAF3SURBVEjH7dZXUwIxEAdwBBtlFezo2fUUe8NeDjtibygqVvREb7//o8kNw4wnWRJefOH/cnnIb26ym2TicuXi8fpBkCoXEU8AhDEo6QUCUtJHQkICDY2aUqFQFoUiWRwKpAQsLGVgQUnBjbysVINzBiEp2GUQEkg5syaUIJ0y/E+oDWqlwEjKQisVUYbRLPJkJxXh/Ddi8iCN+N6qBJmzNgGC14irSrB77CrGv9OIiZLasYgYl4eNszvbE/V81MIWuSANxzO8nI+9AM03iM8hWcjryZLugKYkotkv2w7uToZHjzVouET80GU3AHe79ih04XQUzDn9YSt2/8cRcIq5PYAB016m04lh2LQdhE8t5u56pI/VOqtLbucsrQwpnMdDRHt6qF3xIO8jjnB39hZfrlOBUcRUGNrOWd91pT8GnxA/b02RI9rRZ29TzOjKl5WWePl6Peos3+RlKAF9ss6n8LT+lWoHdAfkXKDC+bRy1/qLM3913v0A1u29arg/SHIAAAAASUVORK5CYII='
export const AudioFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABuwAAAbsBOuzj4gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANWSURBVHic7Zm9TxRBHIbf2U9vveNOOQ1HJGckaOkVNFZgZUwkUUNBY2FjTCy0sDPRymBBwX9AiSYmWplQmEBJpLDUmAMCChhOPA5Y2NvdWwuQZDG5uY+Zm1mzT7dzO/N798nO7twOCYIANEolu1fRvYkgwDCAHLUDQ0rlytyVixeGeY1PaAJKJbuXaN5nAOd4hajH6s9NJEyTmwSFeoLuTUDQxf9l33GGvi5/n+UxNlXA0W0vHF4SqALQ4TlfDx4SGhEgFawlRE4AwFZCJAUA7CREVgDARkKkBQDtS4i8AKA9Cf+FAKB1CdILUJXGI7YiQXoBpqE3dX6zEqQXkEkloTRxFwDNSZBegKoo6Ok+A+uUyWU6UP8O/ypX6B8MJKY700Xq/S79HcCbWIDoAKKJBYgOIJpYgOgAotGEB7AXYG2MQ3WKcJNDqKZvwk1dR0DMjtQXvhBKF0eg7c2H2mp6DnbuBZzM3bbHl34hdPLiAUBx15FceYh0cQTqwReu9YULqIe2N4/04m2o1SVuNaQTEChW6Jh4W0gtjoF4W1zqSSdg+/Ic3NPXQm1qdQldy/cA1JjXk06Ab+RR6X8Pu+dZqF2zP8GofGReTzoBhxDsn3+MavpWqNX8/YZ5JUkFHHLQfT90zOONILUAL1EAiHp8rLg/mNeQWkCgplDtunF87KaGmNcQvhSmsdf7Cr5xCQBwkH3AfHzpBdT0Hti559zGl3oKdIJYgOgAookFiA4gmliA6ACi4bwOqMEsv4O+MwvVKUJ1iggUA16iAC9xFb5V4Fu+AbgJMLY/wNp4CdX5FmonPmC4MzAqM7xKNwUXAWb5LZIrjwDIv7HM/Bmg2QtIrj5BFC4e4CDA3HoNBFXWw3KDuQB9d471kFyR6jXoG/mO12QuwE22/tGinb6twlyAc3YMIEbzHYlx2LfDMBfgWYPY7ZsEUHdL7gQEu32T8KxB1nGocHkGOJlR7OSn4JsD1HN9cwA7+Sk4mVEeUahw3h3+dykMAL7ZD9/sh5sahpO5A57PYtrusPDtcd5Ivz0umliA6ACiaUTAOvcU/KBmpwogBLNMogigkexUATVXewpgk0WgDrN5lL0uVAHZrLUWeFqBEEwjGtNhnRBMB55WyGatNdrJfwCH4jfLMLBkWAAAAABJRU5ErkJggg==';
export const VideoFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAB2AAAAdgB+lymcgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAASySURBVHic7ZtdaFRHGIafObvZdM0Gk9biPyWmRlqkJCn0SqhBQaMS/CmIqJTai4ogNCQBLwra9rLSG68s1BtJKkJpAiKhKC30VhKvFI0aA/7GnxasLp4z53y9sFVMs3vm7M7Zk4R9YO+++eb93j0zc+YMAxERaPSg14U/XLjnQuCC2Px58+e7eu3aPVG1lYITJdiFzzy4JvAdsAZYCCjbosRxaqiv/1GvW/eJ7dxTMTbgOXwLnADejE/Oa2TIZk/qjo7NcXZiZIALexV8FaeQaVHqDXK509769evj6iLUAIEcLx75pJhHbe2g19HxcRzJQw3wYC8vxnpiKMepU7ncoLthw0e2c5s8AVtsd1oiDU4mc/b5xo0f2EwaaoCCFpsdlslbqXT6nHR2vm8rockkWKlZ3wyl3vZTqV9l8+YVNtKZGGB9nS8bpZb6jvO7bNr0TrmpIr0IzTCW+6nUedm+fXE5SWazAQDN2vPOy65dC0pNMNsNQMF7+smT32Tr1oZS2s96AwCUUqt1EJyTffvqo7adEwYAKJEP9cOHZ6W7Oxul3ZwxAECJrPFv3DgrBw/WmraZUwYAEARr9cTEL3LkSNokfO4ZACiRTn909Gc5fToVGhsW4MJjoNGKMlNyOdTq1WWnEa1/yFy48EWxmJlpgD3+zIS8ys/JIRCFqgFJC0iaqgFJC0iaqgFJC0iaqgFJC0gaow2DNTIZnM5OVFcXqr0dtWgRAHL3LjIyggwNEQwPg+dVVFZRXHhs48RX79wpwfXrEkYwNiZ6xw5bJ82PkzcgnRb/2LHQwqfiHz8ubk3NLDdAKfFPnYpc/EsTBgbEVWr2GqAPHSq5+P/QfX2xGhDbdlgtWUJ6bAzmzYva9HXyeXRLC3LrVimtk9sOO729BYuXS5fgwQOzRNksTne3RWURKWkIKCXBxETBx9pduFDcujrRfX0ik5OhwyAYH59dc4C3cmXRgtz6+lfxdXWie3tF7t8v2sZrbo7FgHiGwNKl5rFPnxIcPYq3YgV+Xx88ezZ93LJldrRNIRYDVEMJp1T/GhEMD0+fszGez5KxGCCTk5HbqPZ2UkNDONu2WctpQjx7gZs3jUNVWxvO4cM4XV2gCqzKIsj4uB1tUSn1RSgYHS08oa1aJV5rq/iDgyJBEL4KjIzEtgrEthsMBgZItbZO3+nly4X/7QK54iK+g5FslvSVK6jly0vR9RK5fRvd0lJ4dShOggcj+Tz+gQMQBKXnCAL8/ftLLd4O5WyGXBDd0xM6xguhe3rK2Qgl9yb4PxN27xbJ580rz+dF79lTbvEzxwAXxGtqEr+/X0TrIn+5Fr+/X7ymJhvFGxlQ+dPhBQtwtmxBtbXB4sUvVoM7d5CLFwnOnDHfJZoROglWj8crpWSmUjUgaQFJUzXAIEZiVxEfodpNDHhkQUhShH5EMLkyc9WOlsojcC0sxuTKzBk7ciqPifbQFyGBnAtjChbZkVUxJmvgXQVPigWZPAF/Az3WZFUIgS/DigfDZbAWBgS+KV9WZRD4uhZ+MomNdCHKhU+B75lpN8le8QjozsBJ0waRb4QJNGj4XKBLoEXFdIPcVI7AfQVXFQyl4YSCv6Ik+AfpZ/69uXAKlwAAAABJRU5ErkJggg=='
export const PdfFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAACPVBMVEUAAADc3Nze3tPg4Mzr6+DbnZ3bnprq6uHo6N/p6d/WhIHVgH3k49jo6ODc2s3c2s7QYGDQYWDMS0zMTE3MTk/NTU7NTk/NT0/NUFHNUVLNUlPOUVLOUlPOU1POU1TOVlbOVlfOWFjOWVjPVlfPWVnPWlrPXFzPXl7PX17QWFnQX1/QYWHQZGTRW1zRXV7RXl/RY2LRZGPRZWXRZmbRZ2bRZ2fSX2DSaWjSbmzTYmPTY2TTZGXTcG/TcXDTdHLUZmfUaWnUdXTUenjUennVamvVeXfVe3rVfHnVfXvVfnzWb3DWgn/Wg4DWhILXc3PXhYPXiYbXiYfXiojYjYnYkI3ZeHnZenvZjovZkY3ZkY7Zk4/Z18ralJHamJTamJXamZXbgYLbm5fbnJjcgoPcg4PdpJ/dqaTdrKfeqqTerqner6nfjo/fsavfsq3fs63fs67ftK7fta/gkpPgk5Tgt7HguLLgurThurThvbfh4NXiwbriwrziw7zixL3ixb7jxr/jxsDjyMHjycHjysPjy8TkzMXkzcbk0MrlpKTl0srl1Mzl1c3l18/mpabm1s7m2NDm2dHnqannqqvnq6vnrKzn3NTn3tXn39fn4Njorq7o5Nvo5t3o597p5dzp5t3p6N/p6eDqs7TqtLXrt7fruLjrurrtwMHvxcXwycnxzc3xzs/z1NT129v239/34uL34+T45+f56On56en56+v67e367+/78PD78vL89PT89vb9+Pj9+fn+/f3//v7///86cIymAAAAEnRSTlMAFhcZGUZHbnCAvMDJ1/Hx+vp2gHwLAAAAAWJLR0S+pNyDwwAAAjFJREFUSMfl1OdTE0EYBvBYEbDgc5KAGIgFwYaK/VAEBUvsXUAj9i5qVFRUELChsSEYkSSrBhGJvbf929wjxpkke9zufXLG58vuvTO/eWd33zmLpSf9h5DeMriPRSeDenXk3NC+OjDRAFYM62cS6kljqCMFIF9yof9xFORKHtwxIr8lCvIkB15THNgYDTmSA0+henxpDIyXHFiHK7NWxMI4yYFe23qlPA5WxMwQ73KKgWOccoIh3A/c4JQTDWFbVlrAFPTZcdoUPAPMaDcD12Ep9pqAgezctskjb8vDSygndcqCdmlYhlpCtsIlC/2jJ7HH8M1RjrOHafWJwyrs0pbLSvpcB2Bb5hWFxam3SMPO+VYA1tLF07FPEDYp+a5pwJiVB2smYvnRQtSLwcAG1inX1ajNXOsqBSgTO2P1TNjXXvg7qU1HLgpdTssS1u6A3h9PH14dh0W2HL80vJOdfmILDhFpuB1VZ5XCgDzchjX2rJtEHt7NgaOGmIDEe/4hMQUN8v/BZAgn+V+Baao6W9E2qqqODZdG5WmZYgCdlNIfnRMAttJP9zNZya1t6UdD2Lzn0a8uBrudm69/CWVo8LBQRzfQSeeBvmBfBV+bNVgpcMYe+IAWhCE6vmdKwIzQK/yB92gJg13BYLDSEL4PfX5dFIFPWG83fe7xeDYZwme7S1IRgS+/WWXOiAhc+LMD0rDbufrkh3dTpeFbljdP8yAKZWc1SRwmRcGBKaJu+ICw+A0HHwFVOzhn8gAAAABJRU5ErkJggg=='
export const DocFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABgFBMVEUAAADc3Nze3tPg4Mzr6+B8weJ6wubq6uHo6N/p6d9Ts+RUtONNsePk49jo6ODc2s3c2s4foeYgoeYAluYBluYCl+YEmOYFmOYGmOcJmucLm+cOnOcRnegSnegUnugVn+gWn+gYoOgcoukdoukgo+kipOkjpOknpuopp+oqp+ouqesvqeszq+s0q+s2rOs3res8r+w9r+w/sOxBsexDsu1Ntu5SuO5Uue5Wue5Xuu9Yuu9eve9fve9ivvBmwPBnwPBpwfBqwvBrwvBswvFtw/FxxfF1xvF5yPKBy/OGl8uHzvOImMuLm8yMnMyU0/WX1PWY1fWb1vWe1/Wp3Per3Pev3vew3vex3/ey3/e74/i/5fnC5vnF5/nKz9rL0NnL0NrL6vrM0drM6vrP6/rQ7PrT7fvV7vvZ18rc8fzd8fzf8vzh4NXl9Pzm9f3n9f3o9v3p6eDp9v3q9v3s9/3u+P3x+f7z+v70+v72+/74/P75/f77/f/8/v/9/v/+//////9u6OF6AAAAE3RSTlMAFhcZGUZHbnCAvLzAydfx8fr6DaE62QAAAAFiS0dEf0i/ceUAAAG3SURBVEjH3dP5NwJRFAfw7IasLxLZRdkJSSF7yb7vSShJyC7cf92beZKpmTePn9L9Yc73vXM+Z+7cc0elEiq7+IZWRRkqmcqnupvLkkwZyClAf2nWH6GcVIYykgFKSxYoKZmglGSDEpIRJktWmCQFeOh28eX2UKA/YYcE6PmCR9S35/2m1Z/FpQL8Gg6Zj3fRG7/AZ5zJ1DjZ4ZD58PD7Ap9xJlPj0mQ4onJ7RCtFHY4YHolWKg2GQ5bEJVqZ+IEyHLIkLtHKxA//fjjeBfGfxA4T/qQU/sY0h2rEXOpUgY0GQ0Nl7NDcXhOLtToFuAMAzxttfDT5AKIrWj6OhyG63kSHkc6+qcBDB0L1V8FBo/NjCV86YHnAtm+iwxB+1JydapETBnHcemtGuvs95W8UIJrA6OBWg5MNbMgMVlY4BHMo6ONTP0526GaFozCDAhd86oFZ/FYzK5yHAbT7ohVateBW7YywOhTSokkYRkhz/KRHurstBhjp7LIev1sQqjq5d9i3YRpfjn04jSObLVS4eoFrp5ePdWvXr+ekyakwPG63/mlX9RXSrRawL3mhCOaWsbryHCI+AWNX7FRc84wGAAAAAElFTkSuQmCC'
export const HtmlFile = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAA+VBMVEUAAADc3Nze3tPg4Mzr6+Dpq47prIzq6uHo6N/p6d/rlG/rlW/qkWrk49jo6ODc2s3c2s7sd0fsd0jZ18rh4NXpwqzpw63p6eDqspbqspfqtJnqtZrqwqvqw67rtpvrt5zsZjDsZzHsZzLsaDLsaDPsaTTsbTnsbzvtbTntbjvtbzzudEPudkXvekzvfVDwhVnxjmbylG/ylW/ylnHznnv0o4L0o4P0qIn0qYr1spb2s5j3u6L3vKX3wq35zLr50cD50cH508P61MX61cb61sf618n62cz85dz85t385t786OD86eL97ef97uj+9PD+9vP//v3//v7///9+RY3vAAAAE3RSTlMAFhcZGUZHbnCAvLzAydfx8fr6DaE62QAAAAFiS0dEUg1gLZAAAAFgSURBVEjH7dPZUoMwFAZg3K3WtWK1VE1Q24LUirsogtZ9J+//MKYw04GQkNOMM+2F/0WGLN9MOBw0Lc7kYrUoC2OaILOFrrq2NC6AJQmsLE8oQpGUQ4EEQL6EQK4EQZ6EQY4EwryEwpwEwwrTQxKYzowqLI0WNBpb/ef1hgGGNYz1/kTHuAaE2ybeTE13TLwBgoxjpRDmHCNFkOOyUgDrTCny5RJAXRWyNczfX1gcjsy8t/hz5GS2XgUNwEimzuCWq8NbjjZ5M9XkTWOU/8d/OFxYRuCUhw/3HYsum3S0nSQmah/EZ1tti27YAtghHl126OiTJA4iX63e2RtyTjd8KaTxqaIh5IyO1rcCfMYIXZLB4Wt0hMz3Fwl8C8PwIQuDboCOfy4k8MnzvGsGnkSHj3fu4FcN9j67kasC0RX52FWCzu0pSuC9S2ODYS8JjNP5q16dg8P5DJxegbrVqUT8AtJhCM2EImaPAAAAAElFTkSuQmCC'
export const FileLink = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAAY1BMVEUAAADc3Nze3tPg4Mzr6+DX08zb1NDq6uHo6N/p6d/UzcbSy8Xk49jo6ODc2s3c2s7Mw77IvbjOxMDUzMjVzMjZ18re19Te2NXh4NXp6eDz8O/z8e/z8fD8+/v8/Pv9/Pz////6siNEAAAAEXRSTlMAFhcZGUZHbnCAvMDJ1/Hx+lNX65wAAAABYktHRCCzaz2AAAAAn0lEQVRIx+3Syw6CQBBE0fEt4AMRRBRk/v8rjZAYla6eCisTulZ3c5LOZJzrttxX2nYzB7ZVXXU9zAGMArA4LkZCJMMQSALKkoGipKAkOShIEg4lCweShsXPHwrAz23GwsigQYMGDf4jTE70kgnDvG7rHBaG2cN732SgFFj610pQQXgBpZ3avA8USn2ce3s7w5rkz4l5GH/Bdcq6dNWLJ9gnz/RKwb+GAAAAAElFTkSuQmCC'